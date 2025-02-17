// src/pages/feed/FeedPage.jsx
import styles from './FeedPage.module.scss';
import FeedList from "../../components/feed/FeedList.jsx";
import Stories from "../../components/feed/Stories.jsx";

const FeedPage = () => {
  return (
    <>
      <main className={styles.mainContent}>
        <Stories />
        <FeedList />
      </main>
      <aside className={styles.sidebar}>
        {/*<Suggestions />*/}
      </aside>
    </>
  );
};

export default FeedPage;