// src/components/feed/FeedItemComments.jsx
import styles from "./FeedItem.module.scss";
import {useSelector} from "react-redux";

const FeedItemComments = ({ commentCount, openModal, postId }) => {

  const commentCountState = useSelector(state => state.comments.commentCounts[postId]);

  const count = commentCountState || commentCount;

  return (
    <div className={styles.commentSection}>
      {count > 0 && (
        <button className={styles.viewCommentsButton} onClick={() => openModal(postId)}>
          댓글 {count}개 보기
        </button>
      )}
    </div>
  );
};

export default FeedItemComments;
