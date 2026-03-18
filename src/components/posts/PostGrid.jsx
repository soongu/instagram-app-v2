// src/components/posts/PostGrid.jsx
import styles from './PostGrid.module.scss';
import PostGridItem from './PostGridItem';

const PostGrid = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <p className={styles.noPosts}>게시물이 없습니다.</p>;
  }

  return (
    <div className={styles.postGrid}>
      {posts.map((post) => (
        <PostGridItem key={post.id ?? post.feed_id} post={post} />
      ))}
    </div>
  );
};

export default PostGrid;
