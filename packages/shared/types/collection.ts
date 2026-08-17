export interface CollectionPost{
  id: number;
  sample_url: string;
  file_url: string;
  video_duration: number | null;
}


export interface Collection {
  id: string;
  name: string;
  posts: CollectionPost[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
