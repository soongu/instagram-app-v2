import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './FollowModal.module.scss';
import { followApi } from '../../../services/api';
import { IoCloseOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../ProfileImage';

const FollowModal = ({ isOpen, onClose, modalType, memberId, currentUsername }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const observer = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 모달이 열리거나 타입이 변경될 때 상태 초기화 및 첫 페이지 조회
      setUsers([]);
      setPage(0);
      setHasNext(true);
      setLoading(false); // Reset loading state from any previous incomplete fetch
      
      const loadInitialUsers = async () => {
        try {
          if (isMounted) setLoading(true);
          let res;
          if (modalType === 'followers') {
            res = await followApi.getFollowers(memberId, 0);
          } else {
            res = await followApi.getFollowings(memberId, 0);
          }
          if (res && res.items && isMounted) {
            setUsers(res.items);
            setHasNext(res.hasNext);
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
      // 닫힐 때 상태를 명시적으로 초기화 (다음 열림시 loading이 true로 굳어있는 현상 방지)
      setUsers([]);
      setLoading(false);
      setHasNext(true);
    }

    return () => {
      isMounted = false;
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, modalType, memberId]);

  const fetchMoreUsers = async (nextPage) => {
    if (loading || !hasNext) return;
    try {
      setLoading(true);
      let res;
      if (modalType === 'followers') {
        res = await followApi.getFollowers(memberId, nextPage);
      } else {
        res = await followApi.getFollowings(memberId, nextPage);
      }
      if (res && res.items) {
        setUsers(prev => [...prev, ...res.items]);
        setHasNext(res.hasNext);
      }
    } catch (error) {
      console.error('추가 유저 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const lastUserElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchMoreUsers(nextPage);
          return nextPage;
        });
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
                    className={styles.profileAvatar}
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
