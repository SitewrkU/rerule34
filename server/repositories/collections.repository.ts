import { randomUUID } from 'crypto';
import { db } from '../db/db';
import type { CollectionPost, Collection } from '@rerule34/shared/types/collection.ts'


export async function getCollections(): Promise<Collection[]> {
  await db.read();
  return db.data.collections;
}

export async function getDefaultCollection(): Promise<Collection> {
  await db.read();
  const def = db.data.collections.find(c => c.isDefault);
  if (!def) throw new Error('Default collection missing: how is this possible?');
  return def;
}

export async function createCollection(name: string): Promise<Collection> {
  await db.read();
  const newCollection: Collection = {
    id: randomUUID(),
    name,
    posts: [],
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.data.collections.push(newCollection);
  await db.write();
  return newCollection;
}

export async function renameCollection(id: string, name: string): Promise<Collection | null> {
  await db.read();
  const collection = db.data.collections.find(c => c.id === id);
  if (!collection) return null;
  if (collection.isDefault) {
    throw Object.assign(new Error('Cannot rename the default collection'), { status: 400 });
  }
  collection.name = name;
  collection.updatedAt = new Date().toISOString();
  await db.write();
  return collection;
}

export async function deleteCollection(id: string): Promise<boolean> {
  await db.read();
  const collection = db.data.collections.find(c => c.id === id);
  if (!collection) return false;
  if (collection.isDefault) {
    throw Object.assign(new Error('Cannot delete the default collection'), { status: 400 });
  }
  db.data.collections = db.data.collections.filter(c => c.id !== id);
  await db.write();
  return true;
}

export async function addPostToCollection(
  collectionId: string,
  post: CollectionPost
): Promise<Collection | null> {
  await db.read();
  const collection = db.data.collections.find(c => c.id === collectionId);
  if (!collection) return null;

  const alreadyExists = collection.posts.some(p => p.id === post.id);
  if (!alreadyExists) {
    collection.posts.push(post);
    collection.updatedAt = new Date().toISOString();
    await db.write();
  }
  return collection;
}

export async function removePostFromCollection(
  collectionId: string,
  postId: string | number
): Promise<Collection | null> {
  await db.read();
  const collection = db.data.collections.find(c => c.id === collectionId);
  if (!collection) return null;

  const before = collection.posts.length;
  collection.posts = collection.posts.filter(p => String(p.id) !== String(postId));

  if (collection.posts.length !== before) {
    collection.updatedAt = new Date().toISOString();
    await db.write();
  }
  return collection;
}