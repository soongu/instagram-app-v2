// src/components/posts/PostGridItem.jsx
import styles from './PostGridItem.module.scss';
import { usePostModal } from '../../hooks/usePostModal';
import { FaHeart, FaComment } from 'react-icons/fa6';
import {useSelector} from "react-redux";

const PostGridItem = ({ post }) => {
  const { openModal } = usePostModal();
  // 피드(feed_id) / 프로필(id) API 차이 대비
  const postId = post.id ?? post.feed_id;
  const thumbnailUrl = post.thumbnailUrl ?? post.mainThumbnail ?? post.images?.[0]?.imageUrl ?? '';
  const hasMultipleImages = post.multipleImages ?? (post.images?.length > 1);

  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const commentCountState = useSelector(state => state.comments.commentCounts[postId]);

  const commentCount = commentCountState ?? post.commentCount ?? 0;
  const likeCount = reduxLikeState?.likeCount ?? post.likeCount ?? 0;

  return (
    <div className={styles.gridItem} onClick={() => openModal(postId)}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="게시물 썸네일" className={styles.thumbnail} />
      ) : (
        <div className={styles.thumbnailPlaceholder} />
      )}
      {hasMultipleImages && (
        <div className={styles.multiImageBadge} aria-label="여러 장의 이미지가 포함된 게시물">
          <span className={styles.multiImageBack} />
          <span className={styles.multiImageFront} />
        </div>
      )}
      <div className={styles.overlay}>
        <span>
          <FaHeart /> {likeCount}
        </span>
        <span>
          <FaComment /> {commentCount}
        </span>
      </div>
    </div>
  );
};

export default PostGridItem;
