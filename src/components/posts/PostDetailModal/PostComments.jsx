// src/components/posts/PostComments.jsx
import { useNavigate } from "react-router-dom";
import styles from './PostDetailModal.module.scss';
import { formatDate, convertHashtagsToJsx, formatCount } from "../../../utils/formatter.jsx";
import { commentApi } from "../../../services/api.js";
import { useState } from "react";

const PostComments = ({ comments, postUser, postContent, postCreatedAt, feedId, onReplyAdded, closeModal, hasMoreComments, onLoadMoreComments, isCommentsLoading }) => {
  const navigate = useNavigate();
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [repliesState, setRepliesState] = useState({});

  const handleViewReplies = async (comment) => {
    const currentState = repliesState[comment.id] || { items: [], cursor: null, hasNext: true, isFirstFetch: true, isLoading: false };
    if (!currentState.hasNext || currentState.isLoading) return;

    setRepliesState(prev => ({
      ...prev,
      [comment.id]: {
        ...currentState,
        isLoading: true
      }
    }));

    try {
      const size = 3;
      const [res] = await Promise.all([
        commentApi.getReplies(feedId, comment.id, currentState.cursor, size),
        new Promise(r => setTimeout(r, 300))
      ]);

      setRepliesState((prev) => {
        const merged = [...currentState.items, ...(res.items || [])];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const newCursor = res.items?.length > 0 ? res.items[res.items.length - 1].id : currentState.cursor;

        return {
          ...prev,
          [comment.id]: {
            items: unique,
            cursor: newCursor,
            hasNext: res.hasNext,
            isFirstFetch: false,
            isLoading: false,
          },
        };
      });
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      setRepliesState(prev => ({
        ...prev,
        [comment.id]: {
          ...currentState,
          isLoading: false
        }
      }));
    }
  };

  const startReply = (targetComment, rootCommentId) => {
    setReplyTargetId(rootCommentId);
    setReplyText(`@${targetComment.username} `);
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
        const prevState = prev[replyTargetId] || { items: [], cursor: null, hasNext: true, isFirstFetch: true };
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
    if (closeModal) closeModal();
    navigate(`/${username}`);
  };

  return (
    <div className={styles.commentsContainer}>
      {/* 원본 게시글 */}
      <div className={styles.commentItem}>
        <div className={styles.postProfileImage} onClick={() => handleUserClick(postUser.username)} style={{ cursor: 'pointer' }}>
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
            <span className={styles.postCaption}>{convertHashtagsToJsx(postContent, handleUserClick)}</span>
          </div>
          {postCreatedAt ? (
            <div className={styles.postTime}>{formatDate(postCreatedAt)}</div>
          ) : null}
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className={styles.commentsList}>
        {isCommentsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonContent}>
                <div className={`${styles.skeletonText} ${styles.skeletonTextShort}`} />
                <div className={`${styles.skeletonText} ${styles.skeletonTextLong}`} />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className={styles.noCommentsContainer}>
            <p className={styles.noComments}>댓글이 없습니다.</p>
            <p className={styles.noCommentsAdditional}>첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.postProfileImage} onClick={() => handleUserClick(comment.username)} style={{ cursor: 'pointer' }}>
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
                  <span className={styles.postCaption}>{convertHashtagsToJsx(comment.content, handleUserClick)}</span>
                </div>
                <div className={styles.commentTimeAndReply}>
                  {comment.createdAt ? (
                    <div className={styles.postTime}>{formatDate(comment.createdAt)}</div>
                  ) : (
                    <div className={styles.postTime} />
                  )}
                  {typeof comment.likeCount === 'number' && comment.likeCount > 0 && (
                    <div className={styles.commentLikes}>좋아요 {formatCount(comment.likeCount)}개</div>
                  )}
                  <button
                    type="button"
                    className={styles.replyButton}
                    onClick={() => startReply(comment, comment.id)}
                  >
                    답글 달기
                  </button>
                </div>

                {repliesState[comment.id]?.items?.map((reply) => (
                  <div key={reply.id} className={styles.commentItem} style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <div className={styles.postProfileImage} onClick={() => handleUserClick(reply.username)} style={{ cursor: 'pointer' }}>
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
                        <span className={styles.postCaption}>{convertHashtagsToJsx(reply.content, handleUserClick)}</span>
                      </div>
                      <div className={styles.commentTimeAndReply}>
                        {reply.createdAt ? (
                          <div className={styles.postTime}>{formatDate(reply.createdAt)}</div>
                        ) : (
                          <div className={styles.postTime} />
                        )}
                        {typeof reply.likeCount === 'number' && reply.likeCount > 0 && (
                          <div className={styles.commentLikes}>좋아요 {formatCount(reply.likeCount)}개</div>
                        )}
                        <button
                          type="button"
                          className={styles.replyButton}
                          onClick={() => startReply(reply, comment.id)}
                        >
                          답글 달기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {typeof comment.replyCount === 'number' && 
                 comment.replyCount > 0 && 
                 repliesState[comment.id]?.hasNext !== false && 
                 (comment.replyCount - (repliesState[comment.id]?.items.length || 0)) > 0 ? (
                  <div className={styles.viewRepliesContainer}>
                    <div className={styles.replyLine} />
                    {repliesState[comment.id]?.isLoading ? (
                      <div className={styles.replySpinner} />
                    ) : (
                      <button className={styles.viewRepliesButton} onClick={() => handleViewReplies(comment)}>
                        답글 보기({comment.replyCount - (repliesState[comment.id]?.items.length || 0)}개)
                      </button>
                    )}
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
        
        {hasMoreComments && (
          <div className={styles.loadMoreContainer}>
            <button type="button" className={styles.loadMoreButton} onClick={onLoadMoreComments}>
              <svg aria-label="댓글 더 보기" fill="currentColor" height="28" role="img" viewBox="0 0 24 24" width="28">
                <circle cx="12" cy="12" fill="none" r="11" stroke="currentColor" strokeWidth="2"></circle>
                <path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="2"></path>
              </svg>
            </button>
          </div>
        )}
      </div>


    </div>
  );
};

export default PostComments;
