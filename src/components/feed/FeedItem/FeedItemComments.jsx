// src/components/feed/FeedItemComments.jsx
import styles from "./FeedItem.module.scss";

const FeedItemComments = ({ commentCount, openModal, postId }) => {
  return (
    <div className={styles.commentSection}>
      {commentCount > 0 && (
        <button className={styles.viewCommentsButton} onClick={() => openModal(postId)}>
          댓글 {commentCount}개 보기
        </button>
      )}
    </div>
  );
};

export default FeedItemComments;
