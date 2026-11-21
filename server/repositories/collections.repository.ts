import { randomUUID } from 'crypto';
import { db } from '../db/db';
import type { CollectionPost, Collection } from '@rerule34/shared/types/collection.ts'


function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function normalizePost(value: unknown): CollectionPost | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const post = value as Record<string, unknown>;

  let id: number;
  if (typeof post.id === 'number' && Number.isFinite(post.id)) {
    id = post.id;
  } else if (
    typeof post.id === 'string' &&
    post.id.trim() !== '' &&
    Number.isFinite(Number(post.id))
  ) {
    id = Number(post.id);
  } else {
    return null;
  }

  const sampleUrl = asNonEmptyString(post.sample_url);
  const fileUrl = asNonEmptyString(post.file_url);
  if (!sampleUrl || !fileUrl) return null;

  const videoDuration =
    typeof post.video_duration === 'number' && Number.isFinite(post.video_duration)
      ? post.video_duration
      : null;

  return {
    id,
    sample_url: sampleUrl,
    file_url: fileUrl,
    video_duration: videoDuration,
  };
}

function normalizeCollection(
  value: unknown,
  index: number,
  usedIds: Set<string>
): Collection | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.posts)) return null;

  const posts: CollectionPost[] = [];
  const postIds = new Set<number>();

  for (const item of raw.posts) {
    const post = normalizePost(item);
    if (!post) return null;
    if (postIds.has(post.id)) continue;

    postIds.add(post.id);
    posts.push(post);
  }

  let id = asNonEmptyString(raw.id) ?? randomUUID();
  while (usedIds.has(id)) id = randomUUID();
  usedIds.add(id);

  const now = new Date().toISOString();

  return {
    id,
    name: asNonEmptyString(raw.name)?.trim() || `Колекція ${index + 1}`,
    posts,
    isDefault: raw.isDefault === true,
    createdAt: asNonEmptyString(raw.createdAt) ?? now,
    updatedAt: asNonEmptyString(raw.updatedAt) ?? now,
  };
}

export function normalizeImportedCollections(value: unknown): Collection[] {
  if (!Array.isArray(value)) {
    throw Object.assign(new Error('collections must be an array'), { status: 400 });
  }

  const usedIds = new Set<string>();
  const collections: Collection[] = [];

  for (let index = 0; index < value.length; index++) {
    const collection = normalizeCollection(value[index], index, usedIds);

    if (!collection) {
      throw Object.assign(new Error(`Invalid collection at index ${index}`), { status: 400 });
    }

    collections.push(collection);
  }

  const defaultIndex = collections.findIndex(c => c.isDefault);

  if (defaultIndex === -1) {
    collections.unshift({
      id: randomUUID(),
      name: 'Збережене',
      posts: [],
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    collections.forEach((collection, index) => {
      collection.isDefault = index === defaultIndex;
    });
  }

  return collections;
}

export async function getCollections(): Promise<Collection[]> {
  await db.read();
  return db.data.collections;
}

export async function replaceCollections(collections: Collection[]): Promise<Collection[]> {
  await db.read();
  db.data.collections = collections;
  await db.write();
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