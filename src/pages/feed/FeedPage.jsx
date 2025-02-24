// src/pages/feed/FeedPage.jsx
import styles from './FeedPage.module.scss';
import FeedList from "../../components/feed/FeedList.jsx";
import Stories from "../../components/feed/Stories.jsx";
import PostDetailModal from "../../components/posts/PostDetailModal/PostDetailModal.jsx";
import {usePostModal} from "../../hooks/usePostModal.js";

const FeedPage = () => {

  const { isOpen } = usePostModal();

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