// src/components/feed/FeedItem.jsx
import { useState } from 'react';
import {
  FaEllipsis,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark
} from 'react-icons/fa6';
import styles from './FeedItem.module.scss';
import Carousel from "../common/Carousel/Carousel.jsx";
import defaultProfileImage from '../../assets/images/default-profile.svg';
import {convertHashtagsToJsx, formatDate} from "../../utils/formatter.jsx";
import {Link} from "react-router-dom";
import {usePostModal} from "../../hooks/usePostModal.js";

const FeedItem = ({ post }) => {
  const { openModal } = usePostModal();

  // 더보기 기능을 위한 상태
  const [isExpanded, setIsExpanded] = useState(false);

  // 텍스트가 3줄 이상인지 확인하기 위한 기준 문자 수
  const TEXT_LIMIT = 30;

  // 게시글 내용 렌더링 함수
  const renderContent = () => {

    const content = post.content;

    if (post.content.length <= TEXT_LIMIT || isExpanded) {
      return (
        <span className={styles.caption}>
          {convertHashtagsToJsx(content)}
        </span>
      );
    }

    return (
      <>
        <span className={styles.caption}>
          {convertHashtagsToJsx(content.slice(0, TEXT_LIMIT))}...
        </span>
        <button
          className={styles.moreButton}
          onClick={() => setIsExpanded(true)}
        >
          더 보기
        </button>
      </>
    );
  };

  const handleDoubleClick = () => {
    // 더블클릭 좋아요 기능은 추후 구현
    console.log('Double clicked!');
  };

  return (
    <article className={styles.post}>
      {/* 피드 헤더 */}
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <Link to={`/${post.username}`} className={styles.profileLink}>
            <div className={styles.profileImage}>
              <img
                src={post.profileImageUrl || defaultProfileImage}
                alt={`${post.username}의 프로필`}
              />
            </div>
          </Link>
          <div className={styles.userDetails}>
            <Link to={`/${post.username}`} className={styles.username}>
              {post.username}
            </Link>
          </div>
        </div>
        <button className={styles.optionsButton}>
          <FaEllipsis />
        </button>
      </header>

      {/* 이미지 캐러셀 */}
      <div className={styles.imageContainer}>
        <Carousel
          items={post.images}
          type="image"
          onImageDoubleClick={handleDoubleClick}
        />
      </div>

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        <div className={styles.actionButtons}>
          <div className={styles.leftButtons}>
            <button className={styles.actionButton}>
              <FaRegHeart />
            </button>
            <button className={styles.actionButton} onClick={() => openModal(post.feed_id)}>
              <FaRegComment />
            </button>
            <button className={styles.actionButton}>
              <FaRegPaperPlane />
            </button>
          </div>
          <button className={styles.actionButton}>
            <FaRegBookmark />
          </button>
        </div>
        <div className={styles.likes}>
          좋아요 <span>{post.likeStatus.likeCount}</span>개
        </div>
      </div>

      {/* 게시글 내용 */}
      <div className={styles.content}>
        <div className={styles.text}>
          <Link to={`/${post.username}`} className={styles.username}>
            {post.username}
          </Link>
          {renderContent()}
        </div>
        <div className={styles.time}>{formatDate(post.createdAt)}</div>
      </div>
    </article>
  );
};

export default FeedItem;