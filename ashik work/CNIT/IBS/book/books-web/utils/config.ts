import store from 'store2';

export class Config {
  private store: typeof store;

  constructor() {
    this.store = store.namespace('books-web');
  }

  get(key: string): any {
    return this.store.get(key);
  }

  set(key: string, value: any): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.remove(key);
  }

  clear(): void {
    this.store.clearAll();
  }
}

export default Config;
