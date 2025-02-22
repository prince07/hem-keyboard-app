const express = require('express');
const { z } = require('zod');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Schema for invoice items
const invoiceItemSchema = z.object({
  productId: z.number().optional(),
  description: z.string(),
  quantity: z.number().min(0),
  rate: z.number().min(0),
  tax: z.number().min(0),
  amount: z.number().min(0)
});

// Schema for invoices
const invoiceSchema = z.object({
  type: z.enum(['sale', 'purchase']),
  partyId: z.number(),
  date: z.string(),
  dueDate: z.string(),
  reference: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'paid', 'cancelled']).default('draft'),
  attachments: z.array(z.string()).optional()
});

// Create invoice
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = invoiceSchema.parse(req.body);
    
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
    const totalTax = data.items.reduce((sum, item) => sum + (item.amount * item.tax / 100), 0);
    const totalAmount = subtotal + totalTax;

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create invoice
      const result = await db.run(`
        INSERT INTO ${data.type === 'sale' ? 'sales_invoices' : 'purchase_invoices'} (
          party_id, date, due_date, reference, subtotal, total_tax, total_amount,
          notes, terms, status, created_by, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.partyId,
        data.date,
        data.dueDate,
        data.reference,
        subtotal,
        totalTax,
        totalAmount,
        data.notes,
        data.terms,
        data.status,
        req.user.id,
        JSON.stringify(data.attachments || [])
      ]);

      // Create invoice items
      for (const item of data.items) {
        await db.run(`
          INSERT INTO ${data.type === 'sale' ? 'sales_invoice_items' : 'purchase_invoice_items'} (
            invoice_id, product_id, description, quantity, rate, tax, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          result.lastID,
          item.productId,
          item.description,
          item.quantity,
          item.rate,
          item.tax,
          item.amount
        ]);
      }

      // If status is submitted, create journal entry
      if (data.status === 'submitted') {
        const accountType = data.type === 'sale' ? 'receivable' : 'payable';
        await createInvoiceJournalEntry(result.lastID, data.type, totalAmount, accountType);
      }

      await db.run('COMMIT');

      const invoice = await getInvoiceWithItems(result.lastID, data.type);
      res.status(201).json(invoice);
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

// Get invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, startDate, endDate, status, partyId } = req.query;
    const table = type === 'sale' ? 'sales_invoices' : 'purchase_invoices';
    
    let query = `
      SELECT 
        i.*,
        p.name as party_name,
        u.name as created_by_name
      FROM ${table} i
      LEFT JOIN parties p ON i.party_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
    `;
    
    const conditions = ['1 = 1'];
    const params = [];

    if (startDate) {
      conditions.push('i.date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('i.date <= ?');
      params.push(endDate);
    }
    if (status) {
      conditions.push('i.status = ?');
      params.push(status);
    }
    if (partyId) {
      conditions.push('i.party_id = ?');
      params.push(partyId);
    }

    query += ` WHERE ${conditions.join(' AND ')}
               ORDER BY i.date DESC, i.id DESC`;

    const invoices = await db.all(query, params);
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single invoice
router.get('/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const invoice = await getInvoiceWithItems(id, type);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update invoice status
router.patch('/:type/:id/status', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status } = req.body;

    if (!['draft', 'submitted', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const table = type === 'sale' ? 'sales_invoices' : 'purchase_invoices';
    const invoice = await db.get(`SELECT * FROM ${table} WHERE id = ?`, id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Update status
      await db.run(`
        UPDATE ${table}
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [status, id]);

      // Handle journal entries based on status change
      if (status === 'submitted' && invoice.status !== 'submitted') {
        const accountType = type === 'sale' ? 'receivable' : 'payable';
        await createInvoiceJournalEntry(id, type, invoice.total_amount, accountType);
      } else if (status === 'cancelled' && invoice.status === 'submitted') {
        // Reverse the journal entry
        const accountType = type === 'sale' ? 'receivable' : 'payable';
        await createInvoiceJournalEntry(id, type, -invoice.total_amount, accountType, true);
      }

      await db.run('COMMIT');

      const updatedInvoice = await getInvoiceWithItems(id, type);
      res.json(updatedInvoice);
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get invoice with items
async function getInvoiceWithItems(id, type) {
  const table = type === 'sale' ? 'sales_invoices' : 'purchase_invoices';
  const itemsTable = type === 'sale' ? 'sales_invoice_items' : 'purchase_invoice_items';

  const invoice = await db.get(`
    SELECT 
      i.*,
      p.name as party_name,
      u.name as created_by_name
    FROM ${table} i
    LEFT JOIN parties p ON i.party_id = p.id
    LEFT JOIN users u ON i.created_by = u.id
    WHERE i.id = ?
  `, id);

  if (!invoice) return null;

  const items = await db.all(`
    SELECT * FROM ${itemsTable}
    WHERE invoice_id = ?
    ORDER BY id
  `, id);

  return {
    ...invoice,
    items,
    attachments: JSON.parse(invoice.attachments || '[]')
  };
}

// Helper function to create journal entry for invoice
async function createInvoiceJournalEntry(invoiceId, type, amount, accountType, isReversal = false) {
  const description = `${isReversal ? 'Reversal of ' : ''}${type === 'sale' ? 'Sales' : 'Purchase'} Invoice #${invoiceId}`;
  
  await db.run(`
    INSERT INTO journal_entries (
      date, reference, description, created_by
    ) VALUES (
      CURRENT_DATE,
      ?,
      ?,
      (SELECT created_by FROM ${type === 'sale' ? 'sales_invoices' : 'purchase_invoices'} WHERE id = ?)
    )
  `, [`${type.toUpperCase()}-${invoiceId}`, description, invoiceId]);

  const journalEntryId = (await db.get('SELECT last_insert_rowid() as id')).id;

  // Get account IDs
  const accounts = await db.all(`
    SELECT id, type FROM accounts 
    WHERE type IN (?, 'revenue', 'expense')
  `, accountType);

  const accountMap = accounts.reduce((map, acc) => {
    map[acc.type] = acc.id;
    return map;
  }, {});

  // Create journal entry lines
  if (type === 'sale') {
    await db.run(`
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit)
      VALUES
        (?, ?, ?, 0),
        (?, ?, 0, ?)
    `, [
      journalEntryId, accountMap.receivable, isReversal ? 0 : amount,
      journalEntryId, accountMap.revenue, isReversal ? 0 : amount
    ]);
  } else {
    await db.run(`
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit)
      VALUES
        (?, ?, ?, 0),
        (?, ?, 0, ?)
    `, [
      journalEntryId, accountMap.expense, isReversal ? 0 : amount,
      journalEntryId, accountMap.payable, isReversal ? 0 : amount
    ]);
  }
}

module.exports = router;
