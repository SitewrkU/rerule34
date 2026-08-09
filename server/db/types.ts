export interface SavedPost {
  id: string | number;
  sample_url: string;
  file_url: string;
}

export interface Collection {
  id: string;
  name: string;
  posts: SavedPost[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}


//Розширювати ці, при наявності нових данних для збереження

export interface DbSchema {
  collections: Collection[];
}

export const defaultData: DbSchema = {
  collections: [],
};