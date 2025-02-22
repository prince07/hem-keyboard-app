const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initializeDatabase() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Chart of Accounts
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
        parent_account INTEGER,
        is_group BOOLEAN DEFAULT 0,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_account) REFERENCES accounts(id)
      );

      -- Parties (Customers and Suppliers)
      CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('customer', 'supplier')),
        email TEXT,
        phone TEXT,
        address TEXT,
        tax_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Journal Entries
      CREATE TABLE IF NOT EXISTS journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        reference_number TEXT,
        notes TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Journal Entry Lines
      CREATE TABLE IF NOT EXISTS journal_entry_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        journal_entry_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        party_id INTEGER,
        debit DECIMAL(15,2) DEFAULT 0,
        credit DECIMAL(15,2) DEFAULT 0,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
        FOREIGN KEY (account_id) REFERENCES accounts(id),
        FOREIGN KEY (party_id) REFERENCES parties(id)
      );

      -- Sales Invoices
      CREATE TABLE IF NOT EXISTS sales_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        date DATE NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'paid', 'cancelled')),
        total_amount DECIMAL(15,2) NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES parties(id)
      );

      -- Sales Invoice Items
      CREATE TABLE IF NOT EXISTS sales_invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity DECIMAL(15,2) NOT NULL,
        rate DECIMAL(15,2) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        account_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id),
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      );

      -- Purchase Invoices
      CREATE TABLE IF NOT EXISTS purchase_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        date DATE NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'paid', 'cancelled')),
        total_amount DECIMAL(15,2) NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES parties(id)
      );

      -- Purchase Invoice Items
      CREATE TABLE IF NOT EXISTS purchase_invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity DECIMAL(15,2) NOT NULL,
        rate DECIMAL(15,2) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        account_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES purchase_invoices(id),
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      );

      -- Payments
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        party_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('receive', 'pay')),
        amount DECIMAL(15,2) NOT NULL,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank')),
        reference_number TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties(id)
      );

      -- Payment References (for linking payments to invoices)
      CREATE TABLE IF NOT EXISTS payment_references (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id INTEGER NOT NULL,
        invoice_type TEXT NOT NULL CHECK (invoice_type IN ('sales', 'purchase')),
        invoice_id INTEGER NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id)
      );
    `);
  }
  return db;
}

// Initialize the database
initializeDatabase().catch(console.error);

module.exports = {
  db: initializeDatabase(),
};
