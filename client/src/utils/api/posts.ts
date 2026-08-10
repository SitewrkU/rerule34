import {api} from "./api.ts";

interface GetPostsParams {
  id?: string;
  pid?: number;
  limit?: number;
  tags?: string;
}

export interface TagSuggestion {
  label: string;
  value: string;
}

export async function getPosts(params: GetPostsParams) {
  const { data } = await api.get('/posts', { params });
  console.log(data);
  return data;
}

export async function getComments(postId: number) {
  const { data } = await api.get(`/posts/${postId}/comments`);
  return data;
}

export async function getTagAutocomplete(query: string): Promise<TagSuggestion[]> {
  const { data } = await api.get("/posts/tags/autocomplete", {
    params: { q: query },
  });
  return data;
}