const express = require('express');
const { z } = require('zod');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Schema for payment references
const paymentReferenceSchema = z.object({
  type: z.enum(['sales_invoice', 'purchase_invoice']),
  invoiceId: z.number(),
  amount: z.number().min(0)
});

// Schema for payments
const paymentSchema = z.object({
  partyId: z.number(),
  date: z.string(),
  type: z.enum(['receive', 'pay']),
  amount: z.number().min(0),
  paymentMethod: z.enum(['cash', 'bank', 'card']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  references: z.array(paymentReferenceSchema).optional(),
  attachments: z.array(z.string()).optional()
});

// Create payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = paymentSchema.parse(req.body);

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create payment
      const result = await db.run(`
        INSERT INTO payments (
          party_id, date, type, amount, payment_method, reference,
          notes, created_by, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.partyId,
        data.date,
        data.type,
        data.amount,
        data.paymentMethod,
        data.reference,
        data.notes,
        req.user.id,
        JSON.stringify(data.attachments || [])
      ]);

      // Create payment references if provided
      if (data.references && data.references.length > 0) {
        for (const ref of data.references) {
          await db.run(`
            INSERT INTO payment_references (
              payment_id, invoice_type, invoice_id, amount
            ) VALUES (?, ?, ?, ?)
          `, [
            result.lastID,
            ref.type,
            ref.invoiceId,
            ref.amount
          ]);

          // Update invoice status if fully paid
          const table = ref.type === 'sales_invoice' ? 'sales_invoices' : 'purchase_invoices';
          const invoice = await db.get(`SELECT * FROM ${table} WHERE id = ?`, ref.invoiceId);
          
          const totalPaid = (await db.get(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payment_references
            WHERE invoice_type = ? AND invoice_id = ?
          `, [ref.type, ref.invoiceId])).total + ref.amount;

          if (totalPaid >= invoice.total_amount) {
            await db.run(`
              UPDATE ${table}
              SET status = 'paid', updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, ref.invoiceId);
          }
        }
      }

      // Create journal entry
      await createPaymentJournalEntry(result.lastID);

      await db.run('COMMIT');

      const payment = await getPaymentWithReferences(result.lastID);
      res.status(201).json(payment);
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, type, partyId } = req.query;
    
    let query = `
      SELECT 
        p.*,
        party.name as party_name,
        u.name as created_by_name
      FROM payments p
      LEFT JOIN parties party ON p.party_id = party.id
      LEFT JOIN users u ON p.created_by = u.id
    `;
    
    const conditions = ['1 = 1'];
    const params = [];

    if (startDate) {
      conditions.push('p.date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('p.date <= ?');
      params.push(endDate);
    }
    if (type) {
      conditions.push('p.type = ?');
      params.push(type);
    }
    if (partyId) {
      conditions.push('p.party_id = ?');
      params.push(partyId);
    }

    query += ` WHERE ${conditions.join(' AND ')}
               ORDER BY p.date DESC, p.id DESC`;

    const payments = await db.all(query, params);
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single payment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await getPaymentWithReferences(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if payment exists
    const payment = await db.get('SELECT * FROM payments WHERE id = ?', id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Update invoice statuses
      const references = await db.all('SELECT * FROM payment_references WHERE payment_id = ?', id);
      for (const ref of references) {
        const table = ref.invoice_type === 'sales_invoice' ? 'sales_invoices' : 'purchase_invoices';
        await db.run(`
          UPDATE ${table}
          SET status = 'submitted', updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND status = 'paid'
        `, ref.invoice_id);
      }

      // Delete payment references
      await db.run('DELETE FROM payment_references WHERE payment_id = ?', id);
      
      // Delete related journal entries
      await db.run('DELETE FROM journal_entry_lines WHERE journal_entry_id IN (SELECT id FROM journal_entries WHERE reference = ?)', `PMT-${id}`);
      await db.run('DELETE FROM journal_entries WHERE reference = ?', `PMT-${id}`);
      
      // Delete payment
      await db.run('DELETE FROM payments WHERE id = ?', id);

      await db.run('COMMIT');
      res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get payment with references
async function getPaymentWithReferences(id) {
  const payment = await db.get(`
    SELECT 
      p.*,
      party.name as party_name,
      u.name as created_by_name
    FROM payments p
    LEFT JOIN parties party ON p.party_id = party.id
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = ?
  `, id);

  if (!payment) return null;

  const references = await db.all(`
    SELECT 
      pr.*,
      CASE pr.invoice_type
        WHEN 'sales_invoice' THEN si.reference
        ELSE pi.reference
      END as invoice_reference,
      CASE pr.invoice_type
        WHEN 'sales_invoice' THEN si.total_amount
        ELSE pi.total_amount
      END as invoice_total_amount
    FROM payment_references pr
    LEFT JOIN sales_invoices si ON pr.invoice_type = 'sales_invoice' AND pr.invoice_id = si.id
    LEFT JOIN purchase_invoices pi ON pr.invoice_type = 'purchase_invoice' AND pr.invoice_id = pi.id
    WHERE pr.payment_id = ?
  `, id);

  return {
    ...payment,
    references,
    attachments: JSON.parse(payment.attachments || '[]')
  };
}

// Helper function to create journal entry for payment
async function createPaymentJournalEntry(paymentId) {
  const payment = await getPaymentWithReferences(paymentId);
  
  await db.run(`
    INSERT INTO journal_entries (
      date, reference, description, created_by
    ) VALUES (?, ?, ?, ?)
  `, [
    payment.date,
    `PMT-${paymentId}`,
    `${payment.type === 'receive' ? 'Payment Received from' : 'Payment Made to'} ${payment.party_name}`,
    payment.created_by
  ]);

  const journalEntryId = (await db.get('SELECT last_insert_rowid() as id')).id;

  // Get account IDs
  const accounts = await db.all(`
    SELECT id, type FROM accounts 
    WHERE type IN ('cash', 'bank', 'receivable', 'payable')
  `);

  const accountMap = accounts.reduce((map, acc) => {
    map[acc.type] = acc.id;
    return map;
  }, {});

  const paymentAccountId = accountMap[payment.payment_method === 'cash' ? 'cash' : 'bank'];

  // Create journal entry lines
  if (payment.type === 'receive') {
    await db.run(`
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit)
      VALUES
        (?, ?, ?, 0),
        (?, ?, 0, ?)
    `, [
      journalEntryId, paymentAccountId, payment.amount,
      journalEntryId, accountMap.receivable, payment.amount
    ]);
  } else {
    await db.run(`
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit)
      VALUES
        (?, ?, ?, 0),
        (?, ?, 0, ?)
    `, [
      journalEntryId, accountMap.payable, payment.amount,
      journalEntryId, paymentAccountId, payment.amount
    ]);
  }
}

module.exports = router;
