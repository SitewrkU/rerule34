export interface RawR34Comment {
  id: string;
  post_id: string;
  body: string;
  creator: string;
  creator_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  body: string;
  creator: string;
  creatorId: string;
  createdAt: string;
}
