// src/components/posts/PostGrid.jsx
import styles from './PostGrid.module.scss';
import PostGridItem from './PostGridItem';

const PostGrid = ({ posts, postModalContext = 'profile' }) => {
  if (!posts || posts.length === 0) {
    return <p className={styles.noPosts}>게시물이 없습니다.</p>;
  }

  return (
    <div className={styles.postGrid}>
      {posts.map((post) => (
        <PostGridItem
          key={post.feed_id ?? post.feedId ?? post.postId ?? post.post_id ?? post.id}
          post={post}
          postModalContext={postModalContext}
        />
      ))}
    </div>
  );
};

export default PostGrid;
