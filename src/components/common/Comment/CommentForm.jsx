import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./CommentForm.module.scss";
import { commentApi, memberApi } from "../../../services/api.js";
import { useDispatch } from 'react-redux';
import { addCommentCount } from '../../../store/commentSlice.js';
import { showToast } from '../../../store/toastSlice.js';
import defaultProfileImage from '../../../assets/images/default-profile.svg';

const MENTION_DEBOUNCE_MS = 300;
const MENTION_MIN_LEN = 1;
const MENTION_LIMIT = 15;

const CommentForm = ({ feedId, onCommentAdded }) => {
  const [newComment, setNewComment] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionRange, setMentionRange] = useState({ start: 0, end: 0 });
  const [isMentionLoading, setIsMentionLoading] = useState(false);

  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const fetchSeqRef = useRef(0);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => clearTimeout(searchTimeoutRef.current);
  }, []);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setNewComment(val);

    const cursorPosition = e.target.selectionStart;
    const beforeCursor = val.substring(0, cursorPosition);
    // @로 시작하는 멘션 패턴 감지 (공백이나 문장 시작 바로 뒤의 @)
    const match = beforeCursor.match(/(^|[\s])@([\w.]*)$/);

    if (match) {
      const keyword = match[2];
      const atIndex = beforeCursor.lastIndexOf('@' + keyword);
      setMentionRange({ start: atIndex, end: cursorPosition });

      clearTimeout(searchTimeoutRef.current);

      if (keyword.length < MENTION_MIN_LEN) {
        fetchSeqRef.current += 1;
        setMentionSuggestions([]);
        setShowMentions(false);
        setIsMentionLoading(false);
        return;
      }

      setIsMentionLoading(true);
      setShowMentions(true);

      const seq = ++fetchSeqRef.current;
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await memberApi.search(keyword, null, MENTION_LIMIT);
          if (seq !== fetchSeqRef.current) return;
          const list = res?.items ?? [];
          setMentionSuggestions(list);
          setShowMentions(list.length > 0);
        } catch {
          if (seq !== fetchSeqRef.current) return;
          setMentionSuggestions([]);
          setShowMentions(false);
        } finally {
          if (seq === fetchSeqRef.current) setIsMentionLoading(false);
        }
      }, MENTION_DEBOUNCE_MS);
    } else {
      clearTimeout(searchTimeoutRef.current);
      fetchSeqRef.current += 1;
      setMentionSuggestions([]);
      setShowMentions(false);
      setIsMentionLoading(false);
    }
  }, []);

  const insertMention = (username) => {
    const before = newComment.substring(0, mentionRange.start);
    const after = newComment.substring(mentionRange.end);
    const updated = `${before}@${username} ${after}`;
    setNewComment(updated);
    fetchSeqRef.current += 1;
    setMentionSuggestions([]);
    setShowMentions(false);
    setIsMentionLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const result = await commentApi.addComment(feedId, { content: newComment.trim() });

      const rawComment = result?.comment ?? result;

      const normalizedComment = {
        id: rawComment?.id,
        content: rawComment?.content,
        username: rawComment?.username,
        userProfileImage: rawComment?.profileImageUrl,
        createdAt: rawComment?.createdAt,
      };

      onCommentAdded?.(normalizedComment);
      dispatch(addCommentCount({ feedId, delta: 1 }));
      setNewComment('');
      setShowMentions(false);
      setMentionSuggestions([]);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      dispatch(showToast({ message: '댓글 작성 중 오류가 발생했습니다.', type: 'error' }));
    }
  };

  return (
    <form className={styles.commentForm} onSubmit={handleSubmit}>
      {/* 멘션 추천 오버레이 */}
      {(showMentions || isMentionLoading) && (
        <div className={styles.mentionOverlay}>
          {isMentionLoading && mentionSuggestions.length === 0 ? (
            <div className={styles.mentionLoading}>
              <div className={styles.spinner} />
            </div>
          ) : (
            mentionSuggestions.map((user) => (
              <button
                key={user.memberId}
                type="button"
                className={styles.mentionItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertMention(user.username)}
              >
                <div className={styles.mentionAvatar}>
                  <img src={user.profileImageUrl || defaultProfileImage} alt={user.username} />
                </div>
                <div className={styles.mentionInfo}>
                  <span className={styles.mentionUsername}>{user.username}</span>
                  {user.name && <span className={styles.mentionName}>{user.name}</span>}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        placeholder="댓글 달기..."
        value={newComment}
        onChange={handleInputChange}
        className={styles.commentInput}
      />
      <button type="submit" className={styles.commentSubmit} disabled={!newComment.trim()}>
        게시
      </button>
    </form>
  );
};

export default CommentForm;
