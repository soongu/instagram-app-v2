// src/components/feed/FeedList/FeedList.jsx
import {useEffect, useRef, useState} from 'react';
import {FaSpinner} from 'react-icons/fa6';
import styles from './FeedList.module.scss';
import {feedApi} from "../../services/api.js";
import FeedItem from "./FeedItem/FeedItem.jsx";

const FeedList = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!hasNext) {
      return;
    }

    const fetchPosts = async () => {

      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const response = await feedApi.getFeedPosts(page);
        const nextItems = response?.items ?? response?.feedList ?? [];
        setPosts(prev => [...prev, ...nextItems]);
        setHasNext(response?.hasNext ?? false);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [page, hasNext]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasNext) {
          setPage((prevPage) => prevPage + 1);
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
          <div className={styles.spinner}>
            <FaSpinner/>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedList;