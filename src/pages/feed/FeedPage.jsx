// src/pages/FeedPage.jsx

import {useEffect, useRef, useState} from "react";
import { feedApi } from "../../services/api";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);

  useEffect(() => {
    const fetchPosts = () => {
      setIsLoading(true);

      setTimeout(async () => {
        const response = await feedApi.getFeedPosts(page);
        console.log(response.data);
        setPosts(prev=> [...prev, ...response.data.feedList]);
        setHasNext(response.data.hasNext);
        setIsLoading(false);
      }, 1000);
    };

    if (hasNext) {
      fetchPosts();
    }
  }, [page, hasNext]);


  // 무한스크롤 처리
  useEffect(() => {

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && hasNext) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [isLoading, hasNext]);



  return (
    <div>
      <h1>Feed</h1>
      {posts.map((post) => (
        <div key={post['feed_id']}>
          <h2>{post.username}</h2>
          <p>{post.content}</p>
        </div>
      ))}

      <div ref={observerRef}>
        {isLoading && <div>Loading...</div>}
      </div>
    </div>
  );
};

export default FeedPage;