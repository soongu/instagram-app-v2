// src/pages/profile/ProfileFeed.jsx
import { useEffect, useState } from 'react';
import { postApi } from '../../services/api';
import PostGrid from '../../components/posts/PostGrid';
import { usePostModal } from '../../hooks/usePostModal';
import PostDetailModal from '../posts/PostDetailModal/PostDetailModal.jsx';
import styles from './ProfileFeed.module.scss';

const ProfileFeed = ({ username }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen } = usePostModal();  // ✅ 모달 상태 가져오기

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 인터셉터가 data만 반환. 응답이 { items: [...] } 또는 배열일 수 있음
        const response = await postApi.getProfilePosts(username);
        setPosts(response?.items ?? response?.feedList ?? response ?? []);
      } catch (error) {
        console.error('Failed to fetch profile posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [username]);

  return (
    <div className={styles.profileFeed}>
      {loading ? <p className={styles.loadingText}>로딩 중...</p> : <PostGrid posts={posts} />}
      {isOpen && <PostDetailModal />}  {/* ✅ 모달이 열릴 때만 렌더링 */}
    </div>
  );
};

export default ProfileFeed;
