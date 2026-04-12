// src/components/posts/PostDetailModal.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePostModal } from '../../../hooks/usePostModal';
import { likeApi, postApi } from '../../../services/api';
import styles from './PostDetailModal.module.scss';
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Carousel from '../../common/Carousel/Carousel';
import PostHeader from './PostHeader';
import PostComments from './PostComments';
import PostActions from './PostActions';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { updateLikeStatus, setLikePending, clearLikePending } from "../../../store/likeSlice.js";
import { showToast } from "../../../store/toastSlice.js";
import { store } from "../../../store/index.js";
import CommentForm from "../../common/Comment/CommentForm.jsx";

const PostDetailModal = () => {
  const { isOpen, postId, context, openModal, closeModal } = usePostModal();
  const [post, setPost] = useState(null);
  const [commentsHasNext, setCommentsHasNext] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const commentsCursorRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const lastLocationRef = useRef(null);
  const reduxLikeState = useSelector(state => state.likes.likes[postId]);
  const likeState = reduxLikeState ?? post?.likeStatus ?? { liked: false, likeCount: 0 };
  const isToggling = useSelector(state => !!state.likes.pendingPostIds[postId]);

  const handleDblClick = async () => {
    if (likeState?.liked) return; // 이미 좋아요일 때 더블클릭 = 유지
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

  const refreshComments = useCallback(async (isSilent) => {
    if (!postId || !isOpen) return;
    const hideLoading = isSilent === true;

    try {
      if (!hideLoading) {
        setIsCommentsLoading(true);
        commentsCursorRef.current = null;
      }

      const currentCount = hideLoading ? (post?.comments?.length ?? 0) : 0;
      const fetchSize = hideLoading ? Math.max(currentCount, 20) : 20;
      const [commentsRes] = await Promise.all([
        postApi.getPostComments(postId, null, fetchSize),
        !hideLoading ? new Promise(resolve => setTimeout(resolve, 500)) : Promise.resolve()
      ]);
      const items = commentsRes?.items ?? [];
      const mappedComments = items.map((c) => ({
        id: c.id,
        content: c.content,
        username: c.username,
        userProfileImage: c.profileImageUrl,
        createdAt: c.createdAt,
        replyCount: c.replyCount,
      }));

      if (items.length > 0) {
        commentsCursorRef.current = items[items.length - 1].id;
      } else {
        commentsCursorRef.current = null;
      }
      setCommentsHasNext(commentsRes?.hasNext ?? false);
      setPost(prev => (prev ? { ...prev, comments: mappedComments } : prev));
    } catch (error) {
      console.error('Failed to fetch post comments:', error);
    } finally {
      if (!hideLoading) setIsCommentsLoading(false);
    }
  }, [postId, isOpen, post?.comments?.length]);

  const loadMoreComments = async () => {
    if (!commentsHasNext || !postId) return;
    try {
      const commentsRes = await postApi.getPostComments(postId, commentsCursorRef.current);
      const items = commentsRes?.items ?? [];
      const newMapped = items.map((c) => ({
        id: c.id,
        content: c.content,
        username: c.username,
        userProfileImage: c.profileImageUrl,
        createdAt: c.createdAt,
        replyCount: c.replyCount,
      }));

      if (items.length > 0) {
        commentsCursorRef.current = items[items.length - 1].id;
      }
      setCommentsHasNext(commentsRes?.hasNext ?? false);
      setPost(prev => (prev ? { ...prev, comments: [...prev.comments, ...newMapped] } : prev));
    } catch (error) {
      console.error('Failed to fetch more comments:', error);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPost(null);
      return;
    }
    if (postId) {
      let isCancelled = false;

      const fetchData = async () => {
        try {
          // 인터셉터가 이미 data만 반환 → response가 곧 게시물 객체
          const response = await postApi.getPost(postId, context);
          const reduxLike = store.getState().likes.likes[postId];

          const normalizedPost = {
            // 화면용 필드(기존 컴포넌트 계약에 맞춤)
            postId: response.postId ?? postId,
            content: response.content ?? '',
            images: (response.imageUrls ?? []).map((imageUrl) => ({ imageUrl })),
            user: response.writer
              ? {
                  username: response.writer.username,
                  profileImage: response.writer.profileImageUrl,
                }
              : { username: '', profileImage: undefined },
            comments: [],
            createdAt: response.createdAt,
            prevPostId: response.prevPostId ?? null,
            nextPostId: response.nextPostId ?? null,
            likeStatus: response.likeStatus ?? reduxLike ?? { liked: false, likeCount: 0 },
          };

          if (response.likeStatus) {
            dispatch(updateLikeStatus({
              postId,
              liked: response.likeStatus.liked,
              likeCount: response.likeStatus.likeCount
            }));
          }

          if (!isCancelled) setPost(normalizedPost);

          // 댓글은 별도 엔드포인트에서 조회
          await refreshComments();
        } catch (error) {
          console.error('Failed to fetch post details:', error);
        }
      };

      fetchData();

      return () => {
        isCancelled = true;
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]);

  useEffect(() => {
    if (!isOpen || !post) return;

    const isTypingTarget = (target) => {
      if (!target) return false;
      const tagName = target.tagName?.toLowerCase();
      if (!tagName) return false;
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
      // contentEditable 영역(예: 에디터)에서도 네비게이션 방지
      if (target.isContentEditable) return true;
      return false;
    };

    const handleKeyDown = (e) => {
      if (e.repeat) return; // 키 길게 누를 때 반복 이동 방지

      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (isTypingTarget(e.target)) return;

      if (e.key === 'ArrowLeft' && post.prevPostId) {
        e.preventDefault();
        openModal(post.prevPostId, context);
      }

      if (e.key === 'ArrowRight' && post.nextPostId) {
        e.preventDefault();
        openModal(post.nextPostId, context);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, post, openModal, context]);

  useEffect(() => {
    if (!isOpen) return;

    const current = `${location.pathname}${location.search}`;
    if (lastLocationRef.current === null) {
      // 모달이 처음 열린 시점의 location을 기록 (마운트에서 바로 닫히는 현상 방지)
      lastLocationRef.current = current;
      return;
    }

    if (lastLocationRef.current !== current) {
      // 모달이 열린 상태에서 라우트가 변경되면(예: 해시태그/프로필 링크 클릭) 모달을 자동으로 닫습니다.
      closeModal();
      lastLocationRef.current = current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, isOpen]);

  useEffect(() => {
    if (!isOpen) lastLocationRef.current = null;
  }, [isOpen]);

  if (!isOpen || !post) return null;



  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBackdrop} onClick={closeModal}></div>
      <button className={styles.closeButton} onClick={closeModal}>
        <FaTimes />
      </button>

      {post.prevPostId && (
        <button 
          className={`${styles.navButton} ${styles.navLeft}`} 
          onClick={() => openModal(post.prevPostId, context)}
        >
          <FaChevronLeft />
        </button>
      )}

      {post.nextPostId && (
        <button 
          className={`${styles.navButton} ${styles.navRight}`} 
          onClick={() => openModal(post.nextPostId, context)}
        >
          <FaChevronRight />
        </button>
      )}

      <div className={styles.modalContent}>
        <div className={styles.modalCarouselContainer}>
          <Carousel items={post.images} type="image" onImageDoubleClick={handleDblClick} />
        </div>

        <div className={styles.modalSidebar}>
          <PostHeader user={post.user} closeModal={closeModal} />
          <PostComments
            feedId={postId}
            comments={post.comments}
            postUser={post.user}
            postContent={post.content}
            postCreatedAt={post.createdAt}
            onReplyAdded={() => refreshComments(true)}
            closeModal={closeModal}
            hasMoreComments={commentsHasNext}
            onLoadMoreComments={loadMoreComments}
            isCommentsLoading={isCommentsLoading}
          />
          <PostActions postId={postId} likeStatus={post.likeStatus} />
          {/* 댓글 입력창 */}
          <div className={styles.comment}>
            <CommentForm feedId={postId} onCommentAdded={() => refreshComments(true)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
