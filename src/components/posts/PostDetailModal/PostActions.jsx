// src/components/posts/PostActions.jsx
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark
} from 'react-icons/fa6';
import styles from './PostDetailModal.module.scss';
import {useDispatch, useSelector} from "react-redux";
import {likeApi} from "../../../services/api.js";
import { updateLikeStatus, setLikePending, clearLikePending } from "../../../store/likeSlice.js";
import { showToast } from "../../../store/toastSlice.js";

const PostActions = ({ postId, likeStatus }) => {

  const dispatch = useDispatch();
  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const likeState = reduxLikeState ?? likeStatus ?? { liked: false, likeCount: 0 };
  const isToggling = useSelector(state => !!state.likes.pendingPostIds[postId]);

  const handleToggleLike = async () => {
    if (isToggling) return;
    dispatch(setLikePending(postId));
    try {
      const res = await likeApi.toggleLike(postId);
      dispatch(updateLikeStatus({ postId, ...res }));
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || '좋아요 처리에 실패했습니다.', type: 'error' }));
    } finally {
      dispatch(clearLikePending(postId));
    }
  };

  return (
    <div className={styles.postActions}>
      <div className={styles.actionButtons}>
        <div className={styles.actionButtonsLeft}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleToggleLike}
            disabled={isToggling}
            aria-busy={isToggling}
          >
            {likeState?.liked ? <FaHeart className={styles.liked} /> : <FaRegHeart />}
          </button>
          <button className={styles.actionButton}><FaRegComment /></button>
          <button className={styles.actionButton}><FaRegPaperPlane /></button>
        </div>
        <button className={styles.actionButton}><FaRegBookmark /></button>
      </div>
      <div className={styles.likesCount}>좋아요 {likeState?.likeCount}개</div>
    </div>
  );
};

export default PostActions;
