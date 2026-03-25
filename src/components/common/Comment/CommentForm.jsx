import { useState } from "react";
import styles from "./CommentForm.module.scss";
import {commentApi} from "../../../services/api.js";
import { useDispatch } from 'react-redux';
import { addCommentCount, incrementCommentCount } from '../../../store/commentSlice.js';
import { showToast } from '../../../store/toastSlice.js';

const CommentForm = ({ feedId, onCommentAdded }) => {
  const [newComment, setNewComment] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      // 댓글 작성 API 호출
      const result = await commentApi.addComment(feedId, { content: newComment.trim() });

      // axios interceptor에서 ApiResponse<T>가 data만 flatten되는 구조를 고려해
      // (새 스펙) CommentResponse 또는 (기존 스펙) { comment, commentCount } 둘 다 지원합니다.
      const rawComment = result?.comment ?? result;
      const commentCount = result?.commentCount;

      const normalizedComment = {
        id: rawComment?.id,
        content: rawComment?.content,
        username: rawComment?.username,
        userProfileImage: rawComment?.profileImageUrl,
        createdAt: rawComment?.createdAt,
      };

      // 모달 등에서 새 댓글을 바로 렌더링하기 위한 콜백
      onCommentAdded?.(normalizedComment);

      // Redux 댓글 수 업데이트(새 스펙에는 commentCount가 없을 수 있음)
      if (typeof commentCount === "number") {
        dispatch(incrementCommentCount({ feedId, commentCount }));
      } else {
        // 새 댓글 생성 응답에 count가 내려오지 않는 경우가 있어,
        // "원댓글 1개 추가"로 간주하고 1 증가시킵니다.
        dispatch(addCommentCount({ feedId, delta: 1 }));
      }

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
