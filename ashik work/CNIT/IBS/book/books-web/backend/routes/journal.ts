const express = require('express');
const { z } = require('zod');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Schema for journal entry validation
const journalEntryLineSchema = z.object({
  accountId: z.number(),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional()
});

const journalEntrySchema = z.object({
  date: z.string(),
  reference: z.string().optional(),
  description: z.string(),
  lines: z.array(journalEntryLineSchema).min(2),
  attachments: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

// Create journal entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = journalEntrySchema.parse(req.body);
    
    // Verify double-entry balance
    const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      return res.status(400).json({ error: 'Debits and credits must be equal' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create journal entry
      const result = await db.run(`
        INSERT INTO journal_entries (
          date, reference, description, created_by, attachments, tags
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data.date,
        data.reference,
        data.description,
        req.user.id,
        JSON.stringify(data.attachments || []),
        JSON.stringify(data.tags || [])
      ]);

      // Create journal entry lines
      for (const line of data.lines) {
        await db.run(`
          INSERT INTO journal_entry_lines (
            journal_entry_id, account_id, debit, credit, description
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          result.lastID,
          line.accountId,
          line.debit,
          line.credit,
          line.description
        ]);
      }

      await db.run('COMMIT');

      const entry = await getJournalEntryWithLines(result.lastID);
      res.status(201).json(entry);
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

// Get journal entries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, account, reference } = req.query;
    let query = `
      SELECT 
        je.*,
        u.name as created_by_name,
        COUNT(DISTINCT jel.id) as line_count,
        SUM(jel.debit) as total_debit
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    `;
    
    const conditions = ['1 = 1'];
    const params = [];

    if (startDate) {
      conditions.push('je.date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('je.date <= ?');
      params.push(endDate);
    }
    if (reference) {
      conditions.push('je.reference LIKE ?');
      params.push(`%${reference}%`);
    }
    if (account) {
      conditions.push('jel.account_id = ?');
      params.push(account);
    }

    query += ` WHERE ${conditions.join(' AND ')}
               GROUP BY je.id
               ORDER BY je.date DESC, je.id DESC`;

    const entries = await db.all(query, params);
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single journal entry
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await getJournalEntryWithLines(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete journal entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if entry exists
    const entry = await db.get('SELECT * FROM journal_entries WHERE id = ?', id);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Delete lines first
      await db.run('DELETE FROM journal_entry_lines WHERE journal_entry_id = ?', id);
      // Delete entry
      await db.run('DELETE FROM journal_entries WHERE id = ?', id);

      await db.run('COMMIT');
      res.json({ message: 'Journal entry deleted successfully' });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get journal entry with lines
async function getJournalEntryWithLines(id) {
  const entry = await db.get(`
    SELECT 
      je.*,
      u.name as created_by_name
    FROM journal_entries je
    LEFT JOIN users u ON je.created_by = u.id
    WHERE je.id = ?
  `, id);

  if (!entry) return null;

  const lines = await db.all(`
    SELECT 
      jel.*,
      a.name as account_name,
      a.code as account_code
    FROM journal_entry_lines jel
    LEFT JOIN accounts a ON jel.account_id = a.id
    WHERE jel.journal_entry_id = ?
    ORDER BY jel.id
  `, id);

  return {
    ...entry,
    lines,
    attachments: JSON.parse(entry.attachments || '[]'),
    tags: JSON.parse(entry.tags || '[]')
  };
}

module.exports = router;
