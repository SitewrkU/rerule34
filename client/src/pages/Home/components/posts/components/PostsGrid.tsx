import type {Post} from "@rerule34/shared/types/post.ts";
import {PostItem} from "../../postItem/PostItem.tsx";
import styles from '../Posts.module.css';

type PostsGridProps = {
  posts: Post[];
};

export const PostsGrid = ({posts}: PostsGridProps) => (
  <div className={styles.posts}>
    {posts.map(post => <PostItem key={post.id} post={post}/>)}
  </div>
);