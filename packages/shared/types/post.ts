export interface RawR34Post {
  preview_url: string;
  sample_url: string;
  file_url: string;
  directory: number;
  hash: string;
  width: number;
  height: number;
  id: number;
  image: string;
  change: number;
  owner: string;
  parent_id: number;
  rating: 'safe' | 'questionable' | 'explicit';
  sample: boolean;
  sample_height: number;
  sample_width: number;
  score: number;
  tags: string;
  source: string;
  status: string;
  has_notes: boolean;
  comment_count: number;
}

export interface Post {
  id: number;
  preview_url: string;
  sample_url: string;
  file_url: string;
  score: number;
  comment_count: number;
  tags: string[];
  owner: string;
  createdAt: string;
  rating: 'safe' | 'questionable' | 'explicit';

  duration: number | null;
}