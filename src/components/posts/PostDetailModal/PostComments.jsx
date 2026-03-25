// src/components/posts/PostComments.jsx
import { useNavigate } from "react-router-dom";
import styles from './PostDetailModal.module.scss';
import { formatDate, convertHashtagsToJsx } from "../../../utils/formatter.jsx";

const PostComments = ({ comments, postUser, postContent, postCreatedAt }) => {
  const navigate = useNavigate();

  const handleUserClick = (username) => {
    navigate(`/${username}`);
  };

  return (
    <div className={styles.commentsContainer}>
      {/* 원본 게시글 */}
      <div className={styles.commentItem}>
        <div className={styles.postProfileImage}>
          <img
            src={postUser.profileImage ?? postUser.profileImageUrl}
            alt="Profile"
          />
        </div>
        <div className={styles.commentContent}>
          <div>
            <span className={styles.postUsername} onClick={() => handleUserClick(postUser.username)}>
              {postUser.username}
            </span>
            <span className={styles.postCaption}>{convertHashtagsToJsx(postContent)}</span>
          </div>
          {postCreatedAt ? (
            <div className={styles.postTime}>{formatDate(postCreatedAt)}</div>
          ) : null}
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className={styles.commentsList}>
        {comments.length === 0 ? (
          <div className={styles.noCommentsContainer}>
            <p className={styles.noComments}>댓글이 없습니다.</p>
            <p className={styles.noCommentsAdditional}>첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.postProfileImage}>
                <img
                  src={comment.userProfileImage ?? comment.profileImageUrl}
                  alt="Profile"
                />
              </div>
              <div className={styles.commentContent}>
                <span className={styles.postUsername} onClick={() => handleUserClick(comment.username)}>
                  {comment.username}
                </span>
                <span className={styles.postCaption}>{convertHashtagsToJsx(comment.content)}</span>
                {comment.createdAt ? (
                  <div className={styles.postTime}>{formatDate(comment.createdAt)}</div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  );
};

export default PostComments;
