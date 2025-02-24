// src/components/feed/FeedItemCommentForm.jsx
import { useState } from "react";
import styles from "./FeedItem.module.scss";

const FeedItemCommentForm = () => {
  const [comment, setComment] = useState("");

  return (
    <form className={styles.commentForm}>
      <input
        type="text"
        placeholder="댓글 달기..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className={styles.commentInput}
      />
      <button type="submit" className={styles.commentSubmit} disabled={!comment.trim()}>
        게시
      </button>
    </form>
  );
};

export default FeedItemCommentForm;
