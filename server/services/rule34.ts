import type {RawR34Post, Post} from "@rerule34/shared/types/post";
import { R34_USER_ID, R34_API_KEY } from '../config/env'
import axios from 'axios'

export const BASE_URL = 'https://api.rule34.xxx/index.php';
export const AUTOCOMPLETE_URL = 'https://api.rule34.xxx/autocomplete.php';

export async function callApi(params: any) {
  try{
    const response = await axios.get<RawR34Post[]>(BASE_URL, {
      params: {
        page: 'dapi',
        s: 'post',
        q: 'index',
        json: 1,
        api_key: R34_API_KEY,
        user_id: R34_USER_ID,
        ...params,
      },
    });
    return response.data.map(mapRawPosts);
  }catch(err){
    console.error(err);
    throw err;
  }
}


function mapRawPosts(raw: RawR34Post): Post{
  return {
    id: raw.id,
    file_url: raw.file_url,
    preview_url: raw.preview_url,
    sample_url: raw.sample_url,
    tags: raw.tags.split(' ').filter(Boolean),
    score: raw.score,
    comment_count: raw.comment_count,
    owner: raw.owner,
    createdAt: new Date(raw.change * 1000).toISOString(),
    rating: raw.rating,
    duration: null
  }
}



export async function autocompleteTags(query: string): Promise<{ label: string; value: string }[]> {
  try{
    const { data } = await axios.get(AUTOCOMPLETE_URL, {
      params: { q: query },
    })
    return data
  }catch(err){
    throw err;
  }
}