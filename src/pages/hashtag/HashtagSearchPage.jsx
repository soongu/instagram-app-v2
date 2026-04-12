// src/pages/hashtag/HashtagSearchPage.jsx
import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { postApi } from '../../services/api';
import PostGrid from '../../components/posts/PostGrid';
import { usePostModal } from '../../hooks/usePostModal';
import PostDetailModal from '../../components/posts/PostDetailModal/PostDetailModal.jsx';
import styles from './HashtagSearchPage.module.scss';
import { useDispatch } from 'react-redux';
import { clearCommentCounts } from '../../store/commentSlice';

const PAGE_SIZE = 12;

function normalizeTagFromQuery(q) {
  if (!q || typeof q !== 'string') return '';
  let decoded = q;
  try {
    decoded = decodeURIComponent(q);
  } catch {
    decoded = q;
  }
  const trimmed = decoded.trim();
  if (trimmed.startsWith('#')) return trimmed.slice(1);
  return trimmed;
}

const HashtagSearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const tagName = normalizeTagFromQuery(q);

  const [posts, setPosts] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [error, setError] = useState(null);
  const { isOpen } = usePostModal();
  const dispatch = useDispatch();
  const prevIsOpenRef = useRef(isOpen);
  const loadMoreRef = useRef(null);
  const cursorRef = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(
    async ({ append = false, silent = false } = {}) => {
      if (!tagName) return;
      if (append && isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        if (append) setLoadingMore(true);
        else if (!silent) setLoading(true);

        const cursor = append ? cursorRef.current : null;
        const [response] = await Promise.all([
          postApi.getPostsByHashtag(tagName, cursor, PAGE_SIZE),
          append ? new Promise((r) => setTimeout(r, 300)) : Promise.resolve(),
        ]);
        const items = response?.items ?? [];
        const next = response?.hasNext ?? false;

        setHasNext(next);
        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          cursorRef.current = lastItem.id ?? lastItem.post_id ?? lastItem.postId ?? lastItem.feed_id ?? lastItem.feedId;
        } else if (!append) {
          cursorRef.current = null;
        }
        if (append) {
          setPosts((prev) => [...prev, ...items]);
        } else {
          setPosts(items);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch hashtag posts:', err);
        if (!append) {
          setPosts([]);
          setHasNext(false);
          cursorRef.current = null;
          const status = err.response?.status ?? err.response?.data?.status;
          if (status === 404) {
            setError('not_found');
          } else {
            setError('generic');
          }
        }
      } finally {
        isFetchingRef.current = false;
        if (append) setLoadingMore(false);
        else if (!silent) setLoading(false);
      }
    },
    [tagName]
  );

  useEffect(() => {
    if (!tagName) {
      setPosts([]);
      cursorRef.current = null;
      setHasNext(false);
      setLoading(false);
      setHasUserScrolled(false);
      setError(null);
      return;
    }

    cursorRef.current = null;
    setHasUserScrolled(false);
    fetchPosts({ append: false });
  }, [tagName, fetchPosts]);

  useEffect(() => {
    if (hasUserScrolled) return undefined;

    const markScrolled = () => setHasUserScrolled(true);
    // 실제 사용자 스크롤/제스처가 발생한 뒤에만 무한 스크롤을 시작합니다.
    window.addEventListener('wheel', markScrolled, { passive: true });
    window.addEventListener('touchmove', markScrolled, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'End' || e.key === ' ') {
        markScrolled();
      }
    });

    return () => {
      window.removeEventListener('wheel', markScrolled);
      window.removeEventListener('touchmove', markScrolled);
    };
  }, [hasUserScrolled]);

  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen && tagName) {
      dispatch(clearCommentCounts());
      cursorRef.current = null;
      fetchPosts({ append: false, silent: true });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, tagName, fetchPosts, dispatch]);

  const loadMore = useCallback(() => {
    if (!hasNext || loadingMore || loading || !tagName) return;
    fetchPosts({ append: true });
  }, [hasNext, loadingMore, loading, tagName, fetchPosts]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNext || loading || loadingMore || !hasUserScrolled) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, loading, loadingMore, hasUserScrolled, loadMore]);

  if (!tagName) {
    return (
      <main className={styles.hashtagMain}>
        <p className={styles.emptyHint}>검색할 해시태그가 없습니다. URL에 ?q=#태그명 형식으로 접근해 주세요.</p>
      </main>
    );
  }

  return (
    <main className={styles.hashtagMain}>
      <header className={styles.hashtagHeader}>
        <h1 className={styles.hashtagTitle}>#{tagName}</h1>
      </header>

      <section className={styles.hashtagFeed}>
        {loading ? (
          <p className={styles.loadingText}>로딩 중...</p>
        ) : error === 'not_found' ? (
          <p className={styles.errorText}>해당 해시태그를 찾을 수 없습니다.</p>
        ) : error === 'generic' ? (
          <p className={styles.errorText}>게시물을 불러오지 못했습니다.</p>
        ) : (
          <>
            <PostGrid posts={posts} postModalContext="feed" />
            {hasNext ? <div ref={loadMoreRef} className={styles.sentinel} aria-hidden /> : null}
            {loadingMore ? <p className={styles.loadingText}>더 불러오는 중...</p> : null}
          </>
        )}
      </section>

      {isOpen ? <PostDetailModal /> : null}
    </main>
  );
};

export default HashtagSearchPage;
