// src/components/feed/FeedItem.jsx
import { usePostModal } from "../../../hooks/usePostModal.js";
import styles from "./FeedItem.module.scss";
import Carousel from "../../common/Carousel/Carousel.jsx";
import FeedItemHeader from "./FeedItemHeader";
import FeedItemContent from "./FeedItemContent";
import FeedItemActions from "./FeedItemActions";
import FeedItemComments from "./FeedItemComments";
import { likeApi } from "../../../services/api.js";
import { useDispatch, useSelector } from "react-redux";
import { updateLikeStatus, setLikePending, clearLikePending } from "../../../store/likeSlice.js";
import { showToast } from "../../../store/toastSlice.js";
import CommentForm from "../../common/Comment/CommentForm.jsx";

const FeedItem = ({ post }) => {
  const { openModal } = usePostModal();
  const dispatch = useDispatch();
  const postId = post.feed_id;
  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const likeState = reduxLikeState ?? post.likeStatus ?? { liked: false, likeCount: 0 };
  const isToggling = useSelector(state => !!state.likes.pendingPostIds[postId]);

  const handleDblClick = async () => {
    if (likeState?.liked) return; // 이미 좋아요일 때 더블클릭 = 유지 (API 호출 안 함)
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
    <article className={styles.post}>
      <FeedItemHeader username={post.username} profileImage={post.profileImageUrl} />

      <div className={styles.imageContainer}>
        <Carousel items={post.images} type="image" onImageDoubleClick={handleDblClick} />
      </div>

      <FeedItemActions postId={post.feed_id} openModal={openModal} likeStatus={post.likeStatus} />

      <div className={styles.content}>
        <FeedItemContent username={post.username} content={post.content} createdAt={post.createdAt} />
      </div>

      <div className={styles.postComments}>
        <FeedItemComments commentCount={post.commentCount} openModal={openModal} postId={post.feed_id} />

        <CommentForm feedId={post.feed_id} />
      </div>
    </article>
  );
};

export default FeedItem;
