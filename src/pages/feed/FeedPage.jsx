// src/pages/FeedPage.jsx

import { useEffect, useState } from "react";
import { feedApi } from "../../services/api";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = () => {
      setIsLoading(true);

      setTimeout(async () => {
        const response = await feedApi.getFeedPosts();
        console.log(response.data);
        setPosts(response.data.feedList);
        setIsLoading(false);
      }, 1000);
    };

    fetchPosts();
  }, []);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Feed</h1>
      {posts.map((post) => (
        <div key={post['feed_id']}>
          <h2>{post.username}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default FeedPage;