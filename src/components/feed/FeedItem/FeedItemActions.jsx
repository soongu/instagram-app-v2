// src/components/feed/FeedItemActions.jsx
import {FaHeart, FaRegBookmark, FaRegComment, FaRegHeart, FaRegPaperPlane} from "react-icons/fa6";
import styles from "./FeedItem.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {likeApi} from "../../../services/api.js";
import {updateLikeStatus} from "../../../store/likeSlice.js";

const FeedItemActions = ({postId, openModal, likeStatus}) => {

  const dispatch = useDispatch();
  // Redux에 해당 게시물에 대한 좋아요 상태가 있다면 사용하고, 없으면 서버에서 온 초기값(likeStatus) 사용
  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const likeState = reduxLikeState || likeStatus; // { liked, likeCount }

  const handleToggleLike = async () => {
    // API 호출: 서버에 좋아요 토글 요청
    const {data} = await likeApi.toggleLike(postId);
    // API 성공 후 redux 상태 업데이트
    dispatch(updateLikeStatus({...data, postId}));
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
