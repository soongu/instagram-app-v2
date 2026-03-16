// src/pages/feed/FeedPage.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './FeedPage.module.scss';
import FeedList from "../../components/feed/FeedList.jsx";
import Stories from "../../components/feed/Stories.jsx";
import PostDetailModal from "../../components/posts/PostDetailModal/PostDetailModal.jsx";
import { usePostModal } from "../../hooks/usePostModal.js";
import { clearLikes } from "../../store/likeSlice.js";

const FeedPage = () => {
  const dispatch = useDispatch();
  const { isOpen } = usePostModal();

  // 피드 페이지 이탈 시 좋아요 캐시 초기화 → 다음 방문 시 서버 응답만 신뢰
  useEffect(() => {
    return () => dispatch(clearLikes());
  }, [dispatch]);

  return (
    <>
      <main className={styles.mainContent}>
        <Stories />
        <FeedList />
        {isOpen && <PostDetailModal />}
      </main>
      <aside className={styles.sidebar}>
        {/*<Suggestions />*/}
      </aside>
    </>
  );
};

export default FeedPage;