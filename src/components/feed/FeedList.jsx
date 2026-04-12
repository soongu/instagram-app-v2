// src/components/feed/FeedList/FeedList.jsx
import {useEffect, useRef, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './FeedList.module.scss';
import {feedApi} from "../../services/api.js";
import FeedItem from "./FeedItem/FeedItem.jsx";

const FeedSkeleton = () => (
  <div className={styles.skeletonPost}>
    <div className={styles.skeletonHeader}>
      <div className={styles.skeletonAvatar} />
      <div className={styles.skeletonUsername} />
    </div>
    <div className={styles.skeletonImage} />
    <div className={styles.skeletonFooter}>
      <div className={styles.skeletonIconGroup}>
        <div className={styles.skeletonIcon} />
        <div className={styles.skeletonIcon} />
        <div className={styles.skeletonIcon} />
      </div>
      <div className={styles.skeletonTextLine} />
      <div className={styles.skeletonTextLineShort} />
    </div>
  </div>
);

const FeedList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [fetchEpoch, setFetchEpoch] = useState(0);
  const cursorRef = useRef(null);
  const observerRef = useRef(null);
  const pendingRefreshRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!location.state?.refreshFeed) return;
    pendingRefreshRef.current = true;
    setPosts([]);
    cursorRef.current = null;
    setHasNext(true);
    setFetchEpoch((e) => e + 1);
    navigate('.', { replace: true, state: {} });
  }, [location.state, navigate]);

  useEffect(() => {
    if (!hasNext) {
      return;
    }

    let cancelled = false;

    const fetchPosts = async () => {
      isFetchingRef.current = true;
      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (cancelled) { isFetchingRef.current = false; return; }

      try {
        const response = await feedApi.getFeedPosts(cursorRef.current);
        if (cancelled) return;
        const nextItems = response?.items ?? response?.feedList ?? [];
        const shouldReplace = pendingRefreshRef.current && cursorRef.current === null;
        if (shouldReplace) {
          pendingRefreshRef.current = false;
        }
        setPosts((prev) => (shouldReplace ? nextItems : [...prev, ...nextItems]));
        setHasNext(response?.hasNext ?? false);
        if (nextItems.length > 0) {
          const lastItem = nextItems[nextItems.length - 1];
          cursorRef.current = lastItem['feed_id'] ?? lastItem['feedId'];
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        isFetchingRef.current = false;
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPosts();
    return () => {
      cancelled = true;
      setIsLoading(false);
    };
  }, [fetchTrigger, hasNext, fetchEpoch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && hasNext) {
          setFetchTrigger((t) => t + 1);
        }
      },
      {threshold: 0.5}
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasNext]);

  return (
    <>
      <div className={styles.feedList}>
        {posts.map((post) => (
          <FeedItem key={post['feed_id']} post={post}/>
        ))}
      </div>
      <div ref={observerRef} className={styles.loader}>
        {isLoading && (
          <>
            <FeedSkeleton />
            <FeedSkeleton />
          </>
        )}
      </div>
    </>
  );
};

export default FeedList;