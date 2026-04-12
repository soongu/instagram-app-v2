// src/pages/profile/ProfileFeed.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { postApi } from '../../services/api';
import PostGrid from '../../components/posts/PostGrid';
import { usePostModal } from '../../hooks/usePostModal';
import PostDetailModal from '../posts/PostDetailModal/PostDetailModal.jsx';
import styles from './ProfileFeed.module.scss';
import { useDispatch } from 'react-redux';
import { clearCommentCounts } from '../../store/commentSlice';

const ProfileFeed = ({ username }) => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const { isOpen } = usePostModal();
  const cursorRef = useRef(null);
  const loadMoreRef = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async ({ append = false, silent = false } = {}) => {
    if (append && isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      if (append) setLoadingMore(true);
      else if (silent) setIsRefreshing(true);
      else setLoading(true);

      const cursor = append ? cursorRef.current : null;
      const [response] = await Promise.all([
        postApi.getProfilePosts(username, cursor),
        append ? new Promise((r) => setTimeout(r, 300)) : Promise.resolve(),
      ]);
      const items = response?.items ?? response?.feedList ?? response ?? [];
      const next = response?.hasNext ?? false;

      if (items.length > 0) {
        const lastItem = items[items.length - 1];
        cursorRef.current = lastItem.id ?? lastItem.post_id ?? lastItem.postId ?? lastItem.feed_id ?? lastItem.feedId;
      } else if (!append) {
        cursorRef.current = null;
      }
      setHasNext(next);
      if (append) {
        setPosts((prev) => [...prev, ...items]);
      } else {
        setPosts(items);
      }
    } catch (error) {
      console.error('Failed to fetch profile posts:', error);
    } finally {
      isFetchingRef.current = false;
      if (append) setLoadingMore(false);
      else if (silent) setIsRefreshing(false);
      else setLoading(false);
    }
  }, [username]);

  const prevIsOpenRef = useRef(isOpen);

  // 모달을 닫을 때 그리드 카운트(좋아요/댓글)를 확실히 갱신
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      dispatch(clearCommentCounts());
      cursorRef.current = null;
      fetchPosts({ silent: true });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, fetchPosts, dispatch]);

  useEffect(() => {
    cursorRef.current = null;
    fetchPosts();
  }, [username, fetchPosts]);

  // 무한 스크롤 Observer
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNext || loading || loadingMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNext && !loadingMore) {
          fetchPosts({ append: true });
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, loading, loadingMore, fetchPosts]);

  return (
    <div className={styles.profileFeed}>
      {loading ? (
        <p className={styles.loadingText}>로딩 중...</p>
      ) : (
        <>
          <PostGrid posts={posts} />
          {hasNext && <div ref={loadMoreRef} style={{ height: 1 }} aria-hidden />}
        </>
      )}
      {loadingMore && <p className={styles.loadingText}>더 불러오는 중...</p>}
      {isRefreshing ? <p className={styles.loadingText}>카운트 갱신 중...</p> : null}
      {isOpen && <PostDetailModal />}
    </div>
  );
};

export default ProfileFeed;
