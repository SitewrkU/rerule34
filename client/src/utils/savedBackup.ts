import type { Collection } from '@rerule34/shared/types/collection.ts';
import { useCollectionsStore } from '../store/collectionStore';
import { exportCollections, importCollections } from './api/collections';
import { downloadJson, isRecord, readJsonFile } from './backup';

const SAVED_BACKUP_TYPE = 'rer34-saved';
const SAVED_BACKUP_VERSION = 1;

export async function exportSavedBackup(): Promise<void> {
  const collections = await exportCollections();
  const exportedAt = new Date().toISOString();

  const payload = {
    type: SAVED_BACKUP_TYPE,
    version: SAVED_BACKUP_VERSION,
    exportedAt,
    collections,
  };

  downloadJson(`rer34-saved-${exportedAt.slice(0, 10)}.json`, payload);
}

export async function importSavedBackup(file: File): Promise<{ collections: number; posts: number }> {
  const raw = await readJsonFile(file);

  if (!isRecord(raw)) {
    throw new Error('Це не файл збережень Re:R34.');
  }
  if (raw.type !== undefined && raw.type !== SAVED_BACKUP_TYPE) {
    throw new Error('Це не файл збережень Re:R34.');
  }
  if (typeof raw.version === 'number' && raw.version > SAVED_BACKUP_VERSION) {
    throw new Error('Цей файл створений новішою версією застосунку.');
  }
  if (!Array.isArray(raw.collections)) {
    throw new Error('У файлі не знайдено колекцій збережень.');
  }

  const collections = await importCollections(raw.collections as Collection[]);
  useCollectionsStore.getState().replaceCollections(collections);

  return {
    collections: collections.length,
    posts: collections.reduce((total, collection) => total + collection.posts.length, 0),
  };
}
