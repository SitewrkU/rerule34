import {Search, ImageDownload2, Delete3} from "clicons-react";
import styles from '../Posts.module.css';

type PostsHeaderProps = {
  viewedPostsCount: number;
  searchTags: string;
  onClear: () => void;
};

export const PostsHeader = ({viewedPostsCount, searchTags, onClear}: PostsHeaderProps) => (
  <div className={styles.pageInfo}>
    <div className={styles.totalPosts}>
      <p>
        <ImageDownload2/>
        {viewedPostsCount}
        <Delete3 className={styles.erarsePosts} onClick={onClear}/>
      </p>
    </div>
    <div className={styles.searchInputView}>
      <p><Search/> {searchTags}</p>
    </div>
  </div>
);