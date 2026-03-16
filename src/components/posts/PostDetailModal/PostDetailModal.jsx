// src/components/posts/PostDetailModal.jsx
import { useEffect, useState } from 'react';
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
      alert(error.response?.data?.message || '좋아요 처리에 실패했습니다.');
    } finally {
      dispatch(clearLikePending(postId));
    }
  };

  // 기존 댓글에 추가 댓글 렌더링
  const addComment = (newComment) => {
    setPost(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
  };

  useEffect(() => {
    if (isOpen && postId) {
      const fetchPost = async () => {
        try {
          const response = await postApi.getPost(postId);
          setPost(response.data);
        } catch (error) {
          console.error('Failed to fetch post details:', error);
        }
      };
      fetchPost();
    }
  }, [isOpen, postId]);

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
            comments={post.comments}
            postUser={post.user}
            postContent={post.content}
            postCreatedAt={post.createdAt}
          />
          <PostActions postId={postId} likeStatus={post.likeStatus} />
          {/* 댓글 입력창 */}
          <div className={styles.comment}>
            <CommentForm feedId={postId} onCommentAdded={addComment} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
