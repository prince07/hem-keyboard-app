import sqlite3 from 'better-sqlite3';
import { open } from 'sqlite';
import { promises as fs } from 'fs';
import path from 'path';
import { DatabaseManager as CoreDatabaseManager } from './core';

export class DatabaseManager extends CoreDatabaseManager {
  private static instance: DatabaseManager;
  private dbPath: string;

  private constructor() {
    super();
    // Set default database path in the server's data directory
    this.dbPath = path.join(__dirname, '../../../data/company.db');
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async init(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Initialize database connection
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Initialize schema
      await this.initializeSchema();
    } catch (error: any) {
      throw new Error(`Failed to initialize database: ${error?.message || 'Unknown error'}`);
    }
  }

  private async initializeSchema(): Promise<void> {
    // Create necessary tables
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        currency TEXT NOT NULL,
        email TEXT,
        fiscal_year_start DATE NOT NULL,
        fiscal_year_end DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS account (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT,
        type TEXT NOT NULL,
        parent_account_id INTEGER,
        is_group BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_account_id) REFERENCES account(id)
      );

      CREATE TABLE IF NOT EXISTS party (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        default_account_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (default_account_id) REFERENCES account(id)
      );

      CREATE TABLE IF NOT EXISTS transaction (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        type TEXT NOT NULL,
        party_id INTEGER,
        status TEXT DEFAULT 'Draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES party(id)
      );

      CREATE TABLE IF NOT EXISTS transaction_line (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        debit DECIMAL(20,2) DEFAULT 0,
        credit DECIMAL(20,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transaction(id),
        FOREIGN KEY (account_id) REFERENCES account(id)
      );
    `);
  }

  async getCompanyInfo(): Promise<any> {
    return this.db.get('SELECT * FROM company LIMIT 1');
  }

  async createCompany(data: {
    name: string;
    country: string;
    currency: string;
    email?: string;
    fiscal_year_start: string;
    fiscal_year_end: string;
  }): Promise<void> {
    await this.db.run(`
      INSERT INTO company (
        name, country, currency, email, fiscal_year_start, fiscal_year_end
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      data.name,
      data.country,
      data.currency,
      data.email,
      data.fiscal_year_start,
      data.fiscal_year_end
    ]);
  }

  // Add more methods for accounts, parties, and transactions
}

export const databaseManager = DatabaseManager.getInstance();
