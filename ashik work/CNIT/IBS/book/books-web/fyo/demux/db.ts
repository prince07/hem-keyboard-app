import { DatabaseError, NotImplemented } from 'fyo/utils/errors';
import { SchemaMap } from 'schemas/types';
import { DatabaseDemuxBase, DatabaseMethod } from 'utils/db/types';
import { BackendResponse } from 'utils/ipc/types';

export class DatabaseDemux implements DatabaseDemuxBase {
  constructor() {
    // Web version doesn't need electron-specific code
  }

  async connect(filepath: string): Promise<void> {
    // Use IndexedDB or other web storage
    return Promise.resolve();
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }

  async run(query: string, params: unknown[] = []): Promise<void> {
    // Implement using web storage
    return Promise.resolve();
  }

  async get(query: string, params: unknown[] = []): Promise<unknown> {
    // Implement using web storage
    return Promise.resolve(null);
  }

  async all(query: string, params: unknown[] = []): Promise<unknown[]> {
    // Implement using web storage
    return Promise.resolve([]);
  }
}
