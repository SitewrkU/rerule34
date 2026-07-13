import axios from "axios";

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export interface TagSuggestion {
  label: string;
  value: string;
}



export async function getPosts(params: any) {
  const { data } = await api.get('/posts', { params });
  console.log(data);
  return data;
}

export async function getTagAutocomplete(query: string): Promise<TagSuggestion[]> {
  const { data } = await api.get('/posts/tags/autocomplete', {
    params: { q: query },
  });
  return data;
}