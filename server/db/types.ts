import type { Collection } from '@rerule34/shared/types/collection.ts'

//Розширювати ці, при наявності нових данних(не колекцій) для збереження

export interface DbSchema {
  collections: Collection[];
}

export const defaultData: DbSchema = {
  collections: [],
};