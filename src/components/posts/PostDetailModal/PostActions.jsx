// src/components/posts/PostActions.jsx
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark
} from 'react-icons/fa6';
import styles from './PostDetailModal.module.scss';

const PostActions = ({ likeStatus }) => {
  return (
    <div className={styles.postActions}>
      <div className={styles.actionButtons}>
        <div className={styles.actionButtonsLeft}>
          <button className={styles.actionButton}>
            {likeStatus.liked ? <FaHeart className={styles.liked} /> : <FaRegHeart />}
          </button>
          <button className={styles.actionButton}><FaRegComment /></button>
          <button className={styles.actionButton}><FaRegPaperPlane /></button>
        </div>
        <button className={styles.actionButton}><FaRegBookmark /></button>
      </div>
      <div className={styles.likesCount}>좋아요 {likeStatus.likeCount}개</div>
    </div>
  );
};

export default PostActions;
