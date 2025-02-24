// src/components/posts/PostDetailModal.jsx
import { useEffect, useState } from 'react';
import { usePostModal } from '../../../hooks/usePostModal';
import { postApi } from '../../../services/api';
import styles from './PostDetailModal.module.scss';
import { FaTimes } from "react-icons/fa";
import Carousel from '../../common/Carousel/Carousel';
import PostHeader from './PostHeader';
import PostComments from './PostComments';
import PostActions from './PostActions';

const PostDetailModal = () => {
  const { isOpen, postId, closeModal } = usePostModal();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");

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
          <Carousel items={post.images} type="image" />
        </div>

        <div className={styles.modalSidebar}>
          <PostHeader user={post.user} closeModal={closeModal} />
          <PostComments
            comments={post.comments}
            postUser={post.user}
            postContent={post.content}
            postCreatedAt={post.createdAt}
            newComment={newComment}
            setNewComment={setNewComment}
          />
          <PostActions postId={postId} likeStatus={post.likeStatus} />
          {/* 댓글 입력창 */}
          <form className={styles.commentForm}>
            <input
              type="text"
              placeholder="댓글 달기..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.commentInput}
            />
            <button type="submit" className={styles.commentSubmit} disabled={!newComment.trim()}>
              게시
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
