import { useState } from "react";
import styles from "./CommentForm.module.scss";
import {commentApi} from "../../../services/api.js";
import { useDispatch } from 'react-redux';
import { incrementCommentCount } from '../../../store/commentSlice.js';
import { showToast } from '../../../store/toastSlice.js';

const CommentForm = ({ feedId, onCommentAdded }) => {
  const [newComment, setNewComment] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      // 댓글 작성 API 호출
      const response = await commentApi.addComment(feedId, { content: newComment.trim() });
      // response.data: { comment: { … }, commentCount: number }
      const { comment, commentCount } = response.data;
      // 모달 등에서 새 댓글을 바로 렌더링하기 위한 콜백
      if (onCommentAdded) {
        onCommentAdded(comment);
      }
      // Redux 댓글 수 업데이트
      dispatch(incrementCommentCount({feedId, commentCount}));
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      dispatch(showToast({ message: '댓글 작성 중 오류가 발생했습니다.', type: 'error' }));
    }
  };


  return (
    <form className={styles.commentForm} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="댓글 달기..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className={styles.commentInput}
      />
      <button type="submit" className={styles.commentSubmit} disabled={!newComment.trim()}>
        게시
      </button>
    </form>
  );
};

export default CommentForm;
