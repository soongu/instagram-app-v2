// src/components/feed/FeedItemComments.jsx
import styles from "./FeedItem.module.scss";
import {useSelector} from "react-redux";

const FeedItemComments = ({ commentCount, openModal, postId }) => {

  const commentCountState = useSelector(state => state.comments.commentCounts[postId]);

  // 0도 의미 있는 값이므로 `||` 대신 `??` 사용
  // commentCounts는 서버 기존 count를 모르기 때문에 "추가된 델타"만 누적합니다.
  // 따라서 서버 count + 델타 합산으로 보여줍니다.
  const count = (commentCount ?? 0) + (commentCountState ?? 0);

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
