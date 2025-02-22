const express = require('express');
const { z } = require('zod');
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Schema for date range validation
const dateSchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  account: z.string().optional(),
})

// Apply authentication to all routes
router.use(authenticateToken)

router.get('/balance-sheet', async (req, res) => {
  try {
    const { date } = dateSchema.parse(req.query)
    const dateCondition = date ? `WHERE date <= ?` : ''

    const assets = await db.all(`
      SELECT a.name, COALESCE(SUM(t.amount), 0) as balance
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      WHERE a.type = 'asset'
      ${dateCondition}
      GROUP BY a.id
    `, date ? [date] : [])

    const liabilities = await db.all(`
      SELECT a.name, COALESCE(SUM(t.amount), 0) as balance
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      WHERE a.type = 'liability'
      ${dateCondition}
      GROUP BY a.id
    `, date ? [date] : [])

    const equity = await db.all(`
      SELECT a.name, COALESCE(SUM(t.amount), 0) as balance
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      WHERE a.type = 'equity'
      ${dateCondition}
      GROUP BY a.id
    `, date ? [date] : [])

    res.json({
      assets: Object.fromEntries(assets.map(a => [a.name, a.balance])),
      liabilities: Object.fromEntries(liabilities.map(l => [l.name, l.balance])),
      equity: Object.fromEntries(equity.map(e => [e.name, e.balance])),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

router.get('/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate } = dateSchema.parse(req.query)
    const dateCondition = startDate && endDate ? 
      'WHERE t.date BETWEEN ? AND ?' : ''

    const income = await db.all(`
      SELECT a.name, COALESCE(SUM(t.amount), 0) as total
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      WHERE a.type = 'income'
      ${dateCondition}
      GROUP BY a.id
    `, startDate && endDate ? [startDate, endDate] : [])

    const expenses = await db.all(`
      SELECT a.name, COALESCE(SUM(t.amount), 0) as total
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      WHERE a.type = 'expense'
      ${dateCondition}
      GROUP BY a.id
    `, startDate && endDate ? [startDate, endDate] : [])

    const totalIncome = income.reduce((sum, i) => sum + i.total, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0)

    res.json({
      income: Object.fromEntries(income.map(i => [i.name, i.total])),
      expenses: Object.fromEntries(expenses.map(e => [e.name, e.total])),
      netProfit: totalIncome - totalExpenses,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

router.get('/general-ledger', async (req, res) => {
  try {
    const { account, startDate, endDate } = dateSchema.parse(req.query)
    
    let conditions = []
    let params = []

    if (account) {
      conditions.push('a.id = ?')
      params.push(account)
    }
    if (startDate) {
      conditions.push('t.date >= ?')
      params.push(startDate)
    }
    if (endDate) {
      conditions.push('t.date <= ?')
      params.push(endDate)
    }

    const whereClause = conditions.length > 0 ? 
      `WHERE ${conditions.join(' AND ')}` : ''

    const entries = await db.all(`
      SELECT 
        a.name as account_name,
        t.id,
        t.date,
        t.description,
        t.debit,
        t.credit,
        SUM(t.amount) OVER (
          PARTITION BY a.id 
          ORDER BY t.date, t.id
        ) as balance
      FROM accounts a
      JOIN transactions t ON a.id = t.account_id
      ${whereClause}
      ORDER BY a.name, t.date, t.id
    `, params)

    // Group by account
    const ledger = entries.reduce((acc, entry) => {
      if (!acc[entry.account_name]) {
        acc[entry.account_name] = []
      }
      acc[entry.account_name].push({
        id: entry.id,
        date: entry.date,
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
        balance: entry.balance,
      })
      return acc
    }, {} as Record<string, any[]>)

    res.json(ledger)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

module.exports = router
