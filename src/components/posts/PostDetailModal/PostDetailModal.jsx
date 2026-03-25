// src/components/posts/PostDetailModal.jsx
import { useEffect, useState, useCallback } from 'react';
import { usePostModal } from '../../../hooks/usePostModal';
import { likeApi, postApi } from '../../../services/api';
import styles from './PostDetailModal.module.scss';
import { FaTimes } from "react-icons/fa";
import Carousel from '../../common/Carousel/Carousel';
import PostHeader from './PostHeader';
import PostComments from './PostComments';
import PostActions from './PostActions';
import { useDispatch, useSelector } from "react-redux";
import { updateLikeStatus, setLikePending, clearLikePending } from "../../../store/likeSlice.js";
import { showToast } from "../../../store/toastSlice.js";
import { store } from "../../../store/index.js";
import CommentForm from "../../common/Comment/CommentForm.jsx";

const PostDetailModal = () => {
  const { isOpen, postId, closeModal } = usePostModal();
  const [post, setPost] = useState(null);
  const dispatch = useDispatch();
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

  const refreshComments = useCallback(async () => {
    if (!postId || !isOpen) return;
    try {
      const commentsRes = await postApi.getPostComments(postId, 1, 20);
      const items = commentsRes?.items ?? [];
      const mappedComments = items.map((c) => ({
        id: c.id,
        content: c.content,
        username: c.username,
        userProfileImage: c.profileImageUrl,
        createdAt: c.createdAt,
        replyCount: c.replyCount,
      }));

      setPost(prev => (prev ? { ...prev, comments: mappedComments } : prev));
    } catch (error) {
      console.error('Failed to fetch post comments:', error);
    }
  }, [postId, isOpen]);

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
          const response = await postApi.getPost(postId, 'feed');
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
            // 스펙상 createdAt가 없을 수 있음. PostComments에서 가드 처리.
            createdAt: undefined,
            prevPostId: response.prevPostId ?? null,
            nextPostId: response.nextPostId ?? null,
            likeStatus: response.likeStatus ?? reduxLike ?? { liked: false, likeCount: 0 },
          };

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
  }, [isOpen, postId, refreshComments]);

  if (!isOpen || !post) return null;



  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBackdrop} onClick={closeModal}></div>
      <button className={styles.closeButton} onClick={closeModal}>
        <FaTimes />
      </button>

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
            onReplyAdded={refreshComments}
          />
          <PostActions postId={postId} likeStatus={post.likeStatus} />
          {/* 댓글 입력창 */}
          <div className={styles.comment}>
            <CommentForm feedId={postId} onCommentAdded={refreshComments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
