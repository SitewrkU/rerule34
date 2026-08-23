import {Pagination} from 'antd';
import clsx from 'clsx';
import styles from '../Posts.module.css';
import {PAGE_SIZE} from "../hooks/usePostsPagination.ts";

type PaginationPos = 'left' | 'center' | 'right';

type PostsPaginationProps = {
  page: number;
  total: number;
  loading: boolean;
  paginationPos: PaginationPos;
  onChange: (newPage: number) => void;
};

export const PostsPagination = ({page, total, loading, paginationPos, onChange}: PostsPaginationProps) => {
  const className = clsx(
    styles.pagination,
    {
      [styles.pagLeft]: paginationPos === 'left',
      [styles.pagCenter]: paginationPos === 'center',
      [styles.pagRight]: paginationPos === 'right',
    }
  );

  return (
    <Pagination
      className={className}
      align="center"
      current={page}
      pageSize={PAGE_SIZE}
      total={total}
      onChange={onChange}
      showSizeChanger={false}
      disabled={loading}
    />
  );
};