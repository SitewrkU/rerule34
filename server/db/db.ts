import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import {randomUUID} from "node:crypto";
import * as path from 'path';
import * as fs from 'fs';
import { DbSchema, defaultData } from './types';

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const adapter = new JSONFile<DbSchema>(DB_PATH);
export const db = new Low<DbSchema>(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= defaultData;

  // Початкова стандартна колекція
  const hasDefault = db.data.collections.some(c => c.isDefault);
  if (!hasDefault) {
    db.data.collections.unshift({
      id: randomUUID(),
      name: 'Збережене',
      posts: [],
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }


  await db.write(); // створить файл з дефолтними даними, якщо його не було
  console.log(`DB loaded from ${DB_PATH}`);
}