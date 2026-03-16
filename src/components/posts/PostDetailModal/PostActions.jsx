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
import {updateLikeStatus} from "../../../store/likeSlice.js";

const PostActions = ({ postId, likeStatus }) => {

  const dispatch = useDispatch();
  // Redux에 해당 게시물에 대한 좋아요 상태가 있다면 사용하고, 없으면 서버에서 온 초기값(likeStatus) 사용
  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const likeState = reduxLikeState || likeStatus; // { liked, likeCount }


  const handleToggleLike = async () => {
    // API 호출: 서버에 좋아요 토글 요청 (인터셉터가 이미 data만 반환 → { liked, likeCount })
    const res = await likeApi.toggleLike(postId);
    dispatch(updateLikeStatus({ postId, ...res }));
  };


  return (
    <div className={styles.postActions}>
      <div className={styles.actionButtons}>
        <div className={styles.actionButtonsLeft}>
          <button className={styles.actionButton} onClick={handleToggleLike}>
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
