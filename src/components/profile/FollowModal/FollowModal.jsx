import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './FollowModal.module.scss';
import { followApi } from '../../../services/api';
import { IoCloseOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../ProfileImage';

const FollowModal = ({ isOpen, onClose, modalType, memberId, currentUsername }) => {
  const [users, setUsers] = useState([]);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const cursorRef = useRef(null);
  const isFetchingRef = useRef(false);

  const observer = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setUsers([]);
      cursorRef.current = null;
      setHasNext(true);
      setLoading(false);

      const loadInitialUsers = async () => {
        try {
          if (isMounted) setLoading(true);
          let res;
          if (modalType === 'followers') {
            res = await followApi.getFollowers(memberId, null);
          } else {
            res = await followApi.getFollowings(memberId, null);
          }
          if (res && res.items && isMounted) {
            setUsers(res.items);
            setHasNext(res.hasNext);
            if (res.items.length > 0) {
              cursorRef.current = res.items[res.items.length - 1].memberId;
            }
          }
        } catch (error) {
          console.error('유저 목록 초기 로딩 실패:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadInitialUsers();
    } else {
      document.body.style.overflow = 'auto';
      setUsers([]);
      setLoading(false);
      setHasNext(true);
      cursorRef.current = null;
    }

    return () => {
      isMounted = false;
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, modalType, memberId]);

  const fetchMoreUsers = async () => {
    if (isFetchingRef.current || loading || !hasNext) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      const [res] = await Promise.all([
        modalType === 'followers'
          ? followApi.getFollowers(memberId, cursorRef.current)
          : followApi.getFollowings(memberId, cursorRef.current),
        new Promise((r) => setTimeout(r, 300)),
      ]);
      if (res && res.items) {
        setUsers(prev => [...prev, ...res.items]);
        setHasNext(res.hasNext);
        if (res.items.length > 0) {
          cursorRef.current = res.items[res.items.length - 1].memberId;
        }
      }
    } catch (error) {
      console.error('추가 유저 목록 로딩 실패:', error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  const lastUserElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        fetchMoreUsers();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasNext]);

  const handleToggleFollow = async (userId, isFollowing, isMe) => {
    if (isMe) return; // Cannot follow/unfollow oneself
    try {
      if (isFollowing) {
        await followApi.unfollow(userId);
      } else {
        await followApi.follow(userId);
      }
      setUsers(prev => prev.map(user => 
        user.memberId === userId ? { ...user, following: !isFollowing } : user
      ));
    } catch (error) {
      console.error('팔로우 상태 변경 실패', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleUserClick = (username) => {
    onClose();
    navigate(`/${username}`);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{modalType === 'followers' ? '팔로워' : '팔로잉'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <IoCloseOutline size={28} />
          </button>
        </div>
        <div className={styles.userList}>
          {users.map((user, index) => {
            const isLast = index === users.length - 1;
            return (
              <div 
                key={`${user.memberId}-${index}`} 
                className={styles.userItem}
                ref={isLast ? lastUserElementRef : null}
              >
                <div className={styles.userInfo} onClick={() => handleUserClick(user.username)}>
                  <ProfileImage 
                    imageUrl={user.profileImageUrl} 
                    username={user.username} 
                    editable={false}
                    size="small"
                  />
                  <div className={styles.textInfo}>
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.name}>{user.name}</span>
                  </div>
                </div>
                {!user.me && (
                  <button 
                    className={`${styles.followButton} ${user.following ? styles.following : ''}`}
                    onClick={() => handleToggleFollow(user.memberId, user.following, user.me)}
                  >
                    {user.following ? '팔로잉' : '팔로우'}
                  </button>
                )}
              </div>
            );
          })}
          {loading && <div className={styles.loadingSpinner}>로딩중...</div>}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
