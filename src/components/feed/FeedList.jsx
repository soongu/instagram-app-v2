// src/components/feed/FeedList/FeedList.jsx
import {useEffect, useRef, useState} from 'react';
import { useDispatch } from "react-redux";
import {FaSpinner} from 'react-icons/fa6';
import styles from './FeedList.module.scss';
import {feedApi} from "../../services/api.js";
import FeedItem from "./FeedItem/FeedItem.jsx";
import { updateLikeStatus } from "../../store/likeSlice.js";
import { incrementCommentCount } from "../../store/commentSlice.js";

const FeedList = () => {
  const dispatch = useDispatch();
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
        // 상세 조회에서는 likeStatus가 내려오지 않으므로,
        // 피드 응답의 likeStatus를 리덕스에 시딩해 모달에서 재사용합니다.
        nextItems.forEach((post) => {
          const postId = post?.feed_id;
          const likeStatus = post?.likeStatus;
          if (!postId || !likeStatus) return;
          const { liked, likeCount } = likeStatus;
          if (typeof liked === "boolean" && typeof likeCount === "number") {
            dispatch(updateLikeStatus({ postId, liked, likeCount }));
          }

          // 댓글 수도 상세/모달에서 별도 endpoint로 count를 못받는 경우 대비
          // 피드 응답의 commentCount를 리덕스에 시딩합니다.
          const feedCommentCount = post?.commentCount;
          if (typeof feedCommentCount === "number") {
            dispatch(
              incrementCommentCount({
                feedId: postId,
                commentCount: feedCommentCount,
              })
            );
          }
        });
        setPosts(prev => [...prev, ...nextItems]);
        setHasNext(response?.hasNext ?? false);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [page, hasNext, dispatch]);

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