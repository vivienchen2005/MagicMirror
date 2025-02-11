import * as SQLite from 'expo-sqlite';
import { ClothingDb } from './models';

export class Store {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    this.db = await SQLite.openDatabaseAsync('bounty');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS clothing (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        image TEXT NOT NULL
      );
    `);
  }

  async clear() {
    await this.db?.execAsync(`
      DELETE FROM clothing;
    `);
  }

  async destroy() {
    await this.clear();
    await SQLite.deleteDatabaseAsync('bounty');
  }

  async close() {
    await this.db?.closeAsync();
  }

  async readClothing(): Promise<ClothingDb[]> {
    const clothing = await this.db?.getAllAsync<ClothingDb>('SELECT * FROM clothing');
    return clothing ?? [];
  }

  async writeClothing(clothing: ClothingDb) {
    const statement = await this.db?.prepareAsync(
      'INSERT OR REPLACE INTO clothing (id, name, image) VALUES (?, ?, ?)',
    );
    await statement?.executeAsync([clothing.id, clothing.name, clothing.image]);
  }

  async removeClothing(clothingId: string) {
    const statement = await this.db?.prepareAsync(
      'DELETE FROM clothing WHERE id = ?',
    );
    await statement?.executeAsync([clothingId]);
  }
}
