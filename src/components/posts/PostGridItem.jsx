// src/components/posts/PostGridItem.jsx
import styles from './PostGridItem.module.scss';
import { usePostModal } from '../../hooks/usePostModal';
import { FaHeart, FaComment } from 'react-icons/fa6';

const PostGridItem = ({ post }) => {
  const { openModal } = usePostModal();

  return (
    <div className={styles.gridItem} onClick={() => openModal(post.id)}>
      <img src={post.mainThumbnail} alt="게시물 썸네일" className={styles.thumbnail} />
      <div className={styles.overlay}>
        <span>
          <FaHeart /> {post.likeCount}
        </span>
        <span>
          <FaComment /> {post.commentCount}
        </span>
      </div>
    </div>
  );
};

export default PostGridItem;
