const express = require('express');
const { z } = require('zod');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Schema for party validation
const partySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['customer', 'supplier']),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

// Get all parties
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM parties';
    const params = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';
    const parties = await db.all(query, params);
    res.json(parties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new party
router.post('/', authenticateToken, async (req, res) => {
  try {
    const partyData = partySchema.parse(req.body);

    const result = await db.run(`
      INSERT INTO parties (name, type, email, phone, address, tax_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      partyData.name,
      partyData.type,
      partyData.email,
      partyData.phone,
      partyData.address,
      partyData.taxId
    ]);

    const newParty = await db.get(
      'SELECT * FROM parties WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newParty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update party
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const partyData = partySchema.parse(req.body);

    // Check if party exists
    const existingParty = await db.get(
      'SELECT * FROM parties WHERE id = ?',
      id
    );
    if (!existingParty) {
      return res.status(404).json({ error: 'Party not found' });
    }

    await db.run(`
      UPDATE parties
      SET name = ?, type = ?, email = ?, phone = ?, address = ?, tax_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      partyData.name,
      partyData.type,
      partyData.email,
      partyData.phone,
      partyData.address,
      partyData.taxId,
      id
    ]);

    const updatedParty = await db.get(
      'SELECT * FROM parties WHERE id = ?',
      id
    );

    res.json(updatedParty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete party
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if party exists
    const party = await db.get('SELECT * FROM parties WHERE id = ?', id);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }

    // Check if party has any transactions
    const transactions = await db.get(`
      SELECT COUNT(*) as count
      FROM (
        SELECT id FROM sales_invoices WHERE customer_id = ?
        UNION ALL
        SELECT id FROM purchase_invoices WHERE supplier_id = ?
        UNION ALL
        SELECT id FROM payments WHERE party_id = ?
      )
    `, [id, id, id]);

    if (transactions.count > 0) {
      return res.status(400).json({ error: 'Cannot delete party with transactions' });
    }

    await db.run('DELETE FROM parties WHERE id = ?', id);
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get party balance
router.get('/:id/balance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { asOf } = req.query;

    const party = await db.get('SELECT * FROM parties WHERE id = ?', id);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }

    let dateFilter = '';
    const params = [id, id];

    if (asOf) {
      dateFilter = 'AND date <= ?';
      params.push(asOf);
    }

    const balance = await db.get(`
      WITH transactions AS (
        SELECT 
          date,
          total_amount as amount,
          'invoice' as type
        FROM sales_invoices 
        WHERE customer_id = ? AND status != 'cancelled' ${dateFilter}
        
        UNION ALL
        
        SELECT 
          date,
          -total_amount as amount,
          'invoice' as type
        FROM purchase_invoices 
        WHERE supplier_id = ? AND status != 'cancelled' ${dateFilter}
        
        UNION ALL
        
        SELECT
          date,
          CASE 
            WHEN type = 'receive' THEN -amount
            ELSE amount
          END as amount,
          'payment' as type
        FROM payments 
        WHERE party_id = ? ${dateFilter}
      )
      SELECT COALESCE(SUM(amount), 0) as balance
      FROM transactions
    `, params);

    res.json({
      id: party.id,
      name: party.name,
      type: party.type,
      balance: balance.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
