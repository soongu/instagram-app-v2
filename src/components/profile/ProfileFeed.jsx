// src/pages/profile/ProfileFeed.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { postApi } from '../../services/api';
import PostGrid from '../../components/posts/PostGrid';
import { usePostModal } from '../../hooks/usePostModal';
import PostDetailModal from '../posts/PostDetailModal/PostDetailModal.jsx';
import styles from './ProfileFeed.module.scss';
import { useDispatch } from 'react-redux';
import { clearCommentCounts } from '../../store/commentSlice';

const ProfileFeed = ({ username }) => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOpen } = usePostModal();  // ✅ 모달 상태 가져오기

  const fetchPosts = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setIsRefreshing(true);
      else setLoading(true);

      // 인터셉터가 data만 반환. 응답이 { items: [...] } 또는 배열일 수 있음
      const response = await postApi.getProfilePosts(username);
      setPosts(response?.items ?? response?.feedList ?? response ?? []);
    } catch (error) {
      console.error('Failed to fetch profile posts:', error);
    } finally {
      if (silent) setIsRefreshing(false);
      else setLoading(false);
    }
  }, [username]);

  const prevIsOpenRef = useRef(isOpen);

  // 모달을 닫을 때 그리드 카운트(좋아요/댓글)를 확실히 갱신
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      dispatch(clearCommentCounts());
      fetchPosts({ silent: true });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, fetchPosts, dispatch]);

  useEffect(() => {
    fetchPosts();
  }, [username, fetchPosts]);

  return (
    <div className={styles.profileFeed}>
      {loading ? (
        <p className={styles.loadingText}>로딩 중...</p>
      ) : (
        <PostGrid posts={posts} />
      )}
      {isRefreshing ? <p className={styles.loadingText}>카운트 갱신 중...</p> : null}
      {isOpen && <PostDetailModal />}  {/* ✅ 모달이 열릴 때만 렌더링 */}
    </div>
  );
};

export default ProfileFeed;
