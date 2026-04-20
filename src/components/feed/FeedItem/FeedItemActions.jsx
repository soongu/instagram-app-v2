// src/components/feed/FeedItemActions.jsx
import { useState } from "react";
import {FaHeart, FaRegBookmark, FaRegComment, FaRegHeart, FaRegPaperPlane} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import styles from "./FeedItem.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {likeApi} from "../../../services/api.js";
import { updateLikeStatus, setLikePending, clearLikePending } from "../../../store/likeSlice.js";
import { showToast } from "../../../store/toastSlice.js";
import { formatCount } from "../../../utils/formatter.jsx";
import { startDmWithUsername } from "../../../features/dm/startDm.js";

const FeedItemActions = ({postId, openModal, likeStatus, authorUsername}) => {
  const navigate = useNavigate();
  const [isStartingDm, setIsStartingDm] = useState(false);

  const dispatch = useDispatch();
  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const likeState = reduxLikeState ?? likeStatus ?? { liked: false, likeCount: 0 };
  const isToggling = useSelector(state => !!state.likes.pendingPostIds[postId]);

  const handleStartDm = async () => {
    if (!authorUsername || isStartingDm) return;
    setIsStartingDm(true);
    try {
      await startDmWithUsername(authorUsername, navigate);
    } catch (err) {
      console.error('DM 시작 실패:', err);
      dispatch(showToast({ message: '메시지를 보낼 수 없습니다.', type: 'error' }));
    } finally {
      setIsStartingDm(false);
    }
  };

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
    <div className={styles.actions}>
      <div className={styles.actionButtons}>
        <div className={styles.leftButtons}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleToggleLike}
            disabled={isToggling}
            aria-busy={isToggling}
          >
            {likeState?.liked ? <FaHeart className={styles.liked}/> : <FaRegHeart/>}
          </button>
          <button className={styles.actionButton} onClick={() => openModal(postId)}>
            <FaRegComment/>
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleStartDm}
            disabled={!authorUsername || isStartingDm}
            aria-busy={isStartingDm}
          >
            <FaRegPaperPlane/>
          </button>
        </div>
        <button className={styles.actionButton}>
          <FaRegBookmark/>
        </button>
      </div>
      <div className={styles.likes}>
        좋아요 <span>{formatCount(likeState?.likeCount)}</span>개
      </div>
    </div>
  );
};

export default FeedItemActions;
