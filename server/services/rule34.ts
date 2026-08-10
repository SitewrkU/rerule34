import type {RawR34Post, Post} from "@rerule34/shared/types/post";
import type {RawR34Comment, Comment} from "@rerule34/shared/types/comment";
import { R34_USER_ID, R34_API_KEY } from '../config/env'
import axios from 'axios'
import {XMLParser} from "fast-xml-parser";

export const BASE_URL = 'https://api.rule34.xxx/index.php';
export const AUTOCOMPLETE_URL = 'https://api.rule34.xxx/autocomplete.php';

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });


const ALLOWED_PARAMS = ['tags', 'limit', 'pid', 'id'] as const;

function sanitizeQuery(query: any) {
  const clean: Record<string, any> = {};
  for (const key of ALLOWED_PARAMS) {
    if (query[key] !== undefined) clean[key] = query[key];
  }
  return clean;
}

export async function callApi(params: any) {
  const safeParams = sanitizeQuery(params);
  try{
    const response = await axios.get<RawR34Post[]>(BASE_URL, {
      params: {
        page: 'dapi', s: 'post', q: 'index', json: 1,
        api_key: R34_API_KEY, user_id: R34_USER_ID,
        ...safeParams,
      },
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

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


function mapRawComment(raw: RawR34Comment): Comment {
  return {
    id: raw.id,
    body: raw.body,
    creator: raw.creator,
    creatorId: raw.creator_id,
    createdAt: raw.created_at,
  };
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        page: 'dapi', s: 'comment', q: 'index',
        api_key: R34_API_KEY, user_id: R34_USER_ID,
        post_id: postId,
      },
      responseType: 'text',
      transformResponse: (data) => data, // не даємо axios одразу парсити як JSON
    });

    const parsed = xmlParser.parse(response.data as unknown as string);
    const rawComments = parsed?.comments?.comment ?? [];
    const list = Array.isArray(rawComments) ? rawComments : [rawComments];

    return list.filter(Boolean).map(mapRawComment);
  } catch (err) {
    console.error(err);
    throw err;
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