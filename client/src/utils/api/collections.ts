import {api} from "./api.ts";

export interface CollectionPost{
  id: string | number;
  sample_url: string;
  file_url: string;
}


export interface Collection {
  id: string;
  name: string;
  posts: CollectionPost[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}


export async function getCollections(): Promise<Collection[]> {
  const { data } = await api.get('/collections');
  console.log(data);
  return data.collections;
}

export async function saveToDefaultCollection(post: CollectionPost){
  const { data } = await api.post(
    '/collections/default/posts',
    post
    );

  return data.updated;
}

export async function deleteFromCollection(id: string, postId: string){
  const { data } = await api.delete(`/collections/${id}/posts/${postId}`);

  return data.collection;
}