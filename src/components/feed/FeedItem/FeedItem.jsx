// src/components/feed/FeedItem.jsx
import { usePostModal } from "../../../hooks/usePostModal.js";
import styles from "./FeedItem.module.scss";
import Carousel from "../../common/Carousel/Carousel.jsx";
import FeedItemHeader from "./FeedItemHeader";
import FeedItemContent from "./FeedItemContent";
import FeedItemActions from "./FeedItemActions";
import FeedItemComments from "./FeedItemComments";
import {likeApi} from "../../../services/api.js";
import {useDispatch} from "react-redux";
import {updateLikeStatus} from "../../../store/likeSlice.js";
import CommentForm from "../../common/Comment/CommentForm.jsx";

const FeedItem = ({ post }) => {
  const { openModal } = usePostModal();

  const dispatch = useDispatch();

  const handleDblClick = async () => {
    const { data } = await likeApi.toggleLike(post.feed_id);
    dispatch(updateLikeStatus({ postId: post.feed_id, ...data }));
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
