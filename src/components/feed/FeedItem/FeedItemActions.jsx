// src/components/feed/FeedItemActions.jsx
import {FaHeart, FaRegBookmark, FaRegComment, FaRegHeart, FaRegPaperPlane} from "react-icons/fa6";
import styles from "./FeedItem.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {likeApi} from "../../../services/api.js";
import {updateLikeStatus} from "../../../store/likeSlice.js";

const FeedItemActions = ({postId, openModal, likeStatus}) => {

  const dispatch = useDispatch();
  // Redux 우선, 없으면 서버 초기값(likeStatus), 둘 다 없으면 기본값(피드 외 경로 대비)
  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const likeState = reduxLikeState ?? likeStatus ?? { liked: false, likeCount: 0 };

  const handleToggleLike = async () => {
    // API 호출: 서버에 좋아요 토글 요청 (인터셉터가 이미 data만 반환 → { liked, likeCount })
    const res = await likeApi.toggleLike(postId);
    dispatch(updateLikeStatus({ postId, ...res }));
  };

  return (
    <div className={styles.actions}>
      <div className={styles.actionButtons}>
        <div className={styles.leftButtons}>
          <button className={styles.actionButton} onClick={handleToggleLike}>
            {likeState?.liked ? <FaHeart className={styles.liked}/> : <FaRegHeart/>}
          </button>
          <button className={styles.actionButton} onClick={() => openModal(postId)}>
            <FaRegComment/>
          </button>
          <button className={styles.actionButton}>
            <FaRegPaperPlane/>
          </button>
        </div>
        <button className={styles.actionButton}>
          <FaRegBookmark/>
        </button>
      </div>
      <div className={styles.likes}>
        좋아요 <span>{likeState?.likeCount}</span>개
      </div>
    </div>
  );
};

export default FeedItemActions;
