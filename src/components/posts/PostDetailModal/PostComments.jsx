// src/components/posts/PostComments.jsx
import { useNavigate } from "react-router-dom";
import styles from './PostDetailModal.module.scss';
import { formatDate, convertHashtagsToJsx } from "../../../utils/formatter.jsx";
import { commentApi } from "../../../services/api.js";
import { useState } from "react";

const PostComments = ({ comments, postUser, postContent, postCreatedAt, feedId, onReplyAdded }) => {
  const navigate = useNavigate();
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [repliesState, setRepliesState] = useState({});

  const handleViewReplies = async (comment) => {
    const currentState = repliesState[comment.id] || { items: [], page: 1, hasNext: true, isFirstFetch: true };
    if (!currentState.hasNext) return;

    try {
      const size = 3;
      const res = await commentApi.getReplies(feedId, comment.id, currentState.page, size);

      setRepliesState((prev) => {
        const merged = [...currentState.items, ...(res.items || [])];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        return {
          ...prev,
          [comment.id]: {
            items: unique,
            page: currentState.page + 1,
            hasNext: res.hasNext,
            isFirstFetch: false,
          },
        };
      });
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    }
  };

  const startReply = (comment) => {
    setReplyTargetId(comment.id);
    setReplyText(`@${comment.username} `);
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyTargetId) return;
    const content = replyText.trim();
    if (!content) return;

    try {
      const newReply = await commentApi.addComment(feedId, {
        content,
        parentId: replyTargetId,
      });

      setRepliesState((prev) => {
        const prevState = prev[replyTargetId] || { items: [], page: 1, hasNext: true, isFirstFetch: true };
        const merged = [...prevState.items, newReply];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        return {
          ...prev,
          [replyTargetId]: {
            ...prevState,
            items: unique,
          }
        };
      });

      setReplyTargetId(null);
      setReplyText('');
      await onReplyAdded?.();
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

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
                <div>
                  <span className={styles.postUsername} onClick={() => handleUserClick(comment.username)}>
                    {comment.username}
                  </span>
                  <span className={styles.postCaption}>{convertHashtagsToJsx(comment.content)}</span>
                </div>
                <div className={styles.commentTimeAndReply}>
                  {comment.createdAt ? (
                    <div className={styles.postTime}>{formatDate(comment.createdAt)}</div>
                  ) : (
                    <div className={styles.postTime} />
                  )}
                  {typeof comment.likeCount === 'number' && comment.likeCount > 0 && (
                    <div className={styles.commentLikes}>좋아요 {comment.likeCount}개</div>
                  )}
                  <button
                    type="button"
                    className={styles.replyButton}
                    onClick={() => startReply(comment)}
                  >
                    답글 달기
                  </button>
                </div>

                {repliesState[comment.id]?.items?.map((reply) => (
                  <div key={reply.id} className={styles.commentItem} style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <div className={styles.postProfileImage}>
                      <img
                        src={reply.userProfileImage ?? reply.profileImageUrl}
                        alt="Profile"
                      />
                    </div>
                    <div className={styles.commentContent}>
                      <div>
                        <span className={styles.postUsername} onClick={() => handleUserClick(reply.username)}>
                          {reply.username}
                        </span>
                        <span className={styles.postCaption}>{convertHashtagsToJsx(reply.content)}</span>
                      </div>
                      <div className={styles.commentTimeAndReply}>
                        {reply.createdAt ? (
                          <div className={styles.postTime}>{formatDate(reply.createdAt)}</div>
                        ) : (
                          <div className={styles.postTime} />
                        )}
                        {typeof reply.likeCount === 'number' && reply.likeCount > 0 && (
                          <div className={styles.commentLikes}>좋아요 {reply.likeCount}개</div>
                        )}
                        <button
                          type="button"
                          className={styles.replyButton}
                          onClick={() => startReply(reply)}
                        >
                          답글 달기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {typeof comment.replyCount === 'number' && comment.replyCount > 0 && repliesState[comment.id]?.hasNext !== false ? (
                  <div className={styles.viewRepliesContainer}>
                    <div className={styles.replyLine} />
                    <button className={styles.viewRepliesButton} onClick={() => handleViewReplies(comment)}>
                      답글 보기({comment.replyCount - (repliesState[comment.id]?.items.length || 0)}개)
                    </button>
                  </div>
                ) : null}

                {replyTargetId === comment.id ? (
                  <form className={styles.replyForm} onSubmit={submitReply}>
                    <input
                      className={styles.replyInput}
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`@${comment.username} 답글을 입력하세요`}
                    />
                    <button
                      className={styles.replySubmitButton}
                      type="submit"
                      disabled={!replyText.trim()}
                    >
                      게시
                    </button>
                  </form>
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
