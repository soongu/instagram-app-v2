// src/components/posts/PostGridItem.jsx
import styles from './PostGridItem.module.scss';
import { usePostModal } from '../../hooks/usePostModal';
import { FaHeart, FaComment } from 'react-icons/fa6';
import {useSelector} from "react-redux";

const PostGridItem = ({ post, postModalContext = 'profile' }) => {
  const { openModal } = usePostModal();
  // 프로필/피드 API 응답 키가 다를 수 있어, 상세조회에 맞는 값을 우선으로 선택
  // (프로필 grid은 id만 주기도 하지만, feed_id가 함께 오거나 id가 상세조회용이 아닐 수도 있음)
  const postId = post.feed_id ?? post.feedId ?? post.postId ?? post.post_id ?? post.id;
  
  const handleClick = () => {
    if (!postId) {
      console.warn('PostGridItem: missing postId for modal open', { post });
      return;
    }
    openModal(postId, postModalContext);
  };
  const thumbnailUrl = post.thumbnailUrl ?? post.mainThumbnail ?? post.images?.[0]?.imageUrl ?? '';
  const hasMultipleImages = post.multipleImages ?? (post.images?.length > 1);

  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const commentCountState = useSelector(state => state.comments.commentCounts[postId]);

  // commentCounts는 서버의 기존 count를 모르기 때문에 "추가된 델타"만 누적되는 구조입니다.
  // 따라서 서버(count) + 델타를 합산해 보여줍니다.
  const commentCount = (post.commentCount ?? 0) + (commentCountState ?? 0);
  const likeCount = reduxLikeState?.likeCount ?? post.likeCount ?? 0;

  return (
    <div className={styles.gridItem} onClick={handleClick}>
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
