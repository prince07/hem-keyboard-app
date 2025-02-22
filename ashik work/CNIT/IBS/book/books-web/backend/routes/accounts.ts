const express = require('express');
const { z } = require('zod');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Schema for account validation
const accountSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
  parentAccount: z.number().optional(),
  isGroup: z.boolean().default(false),
  description: z.string().optional(),
});

// Get all accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const accounts = await db.all(`
      SELECT a.*, 
             p.name as parent_name,
             (SELECT COUNT(*) FROM accounts c WHERE c.parent_account = a.id) as child_count
      FROM accounts a
      LEFT JOIN accounts p ON a.parent_account = p.id
      ORDER BY a.code, a.name
    `);

    // Transform into tree structure
    const accountTree = accounts.reduce((tree, account) => {
      if (!account.parent_account) {
        tree[account.id] = { ...account, children: [] };
      }
      return tree;
    }, {});

    accounts.forEach(account => {
      if (account.parent_account && accountTree[account.parent_account]) {
        accountTree[account.parent_account].children.push(account);
      }
    });

    res.json(Object.values(accountTree));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const accountData = accountSchema.parse(req.body);
    
    // Check if parent account exists if specified
    if (accountData.parentAccount) {
      const parentAccount = await db.get(
        'SELECT * FROM accounts WHERE id = ?',
        accountData.parentAccount
      );
      if (!parentAccount) {
        return res.status(400).json({ error: 'Parent account not found' });
      }
    }

    // Check if code is unique if provided
    if (accountData.code) {
      const existingAccount = await db.get(
        'SELECT * FROM accounts WHERE code = ?',
        accountData.code
      );
      if (existingAccount) {
        return res.status(400).json({ error: 'Account code must be unique' });
      }
    }

    const result = await db.run(`
      INSERT INTO accounts (
        name, code, type, parent_account, is_group, description
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      accountData.name,
      accountData.code,
      accountData.type,
      accountData.parentAccount,
      accountData.isGroup,
      accountData.description
    ]);

    const newAccount = await db.get(
      'SELECT * FROM accounts WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newAccount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update account
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const accountData = accountSchema.parse(req.body);

    // Check if account exists
    const existingAccount = await db.get(
      'SELECT * FROM accounts WHERE id = ?',
      id
    );
    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if code is unique if being updated
    if (accountData.code && accountData.code !== existingAccount.code) {
      const accountWithCode = await db.get(
        'SELECT * FROM accounts WHERE code = ? AND id != ?',
        [accountData.code, id]
      );
      if (accountWithCode) {
        return res.status(400).json({ error: 'Account code must be unique' });
      }
    }

    await db.run(`
      UPDATE accounts
      SET name = ?, code = ?, type = ?, parent_account = ?, is_group = ?, description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      accountData.name,
      accountData.code,
      accountData.type,
      accountData.parentAccount,
      accountData.isGroup,
      accountData.description,
      id
    ]);

    const updatedAccount = await db.get(
      'SELECT * FROM accounts WHERE id = ?',
      id
    );

    res.json(updatedAccount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete account
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account exists
    const account = await db.get('SELECT * FROM accounts WHERE id = ?', id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if account has children
    const childCount = await db.get(
      'SELECT COUNT(*) as count FROM accounts WHERE parent_account = ?',
      id
    );
    if (childCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete account with sub-accounts' });
    }

    // Check if account is used in transactions
    const transactionCount = await db.get(
      'SELECT COUNT(*) as count FROM journal_entry_lines WHERE account_id = ?',
      id
    );
    if (transactionCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete account with transactions' });
    }

    await db.run('DELETE FROM accounts WHERE id = ?', id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get account balance
router.get('/:id/balance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [id];

    if (startDate && endDate) {
      dateFilter = 'AND je.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const balance = await db.get(`
      SELECT 
        a.id,
        a.name,
        a.type,
        COALESCE(SUM(CASE 
          WHEN a.type IN ('asset', 'expense') THEN jel.debit - jel.credit
          ELSE jel.credit - jel.debit
        END), 0) as balance
      FROM accounts a
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE a.id = ? ${dateFilter}
      GROUP BY a.id
    `, params);

    if (!balance) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
