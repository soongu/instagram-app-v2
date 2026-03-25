// src/components/posts/PostHeader.jsx
import { FaEllipsis } from 'react-icons/fa6';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from './PostDetailModal.module.scss';
import { followApi, profileApi } from "../../../services/api.js";

const PostHeader = ({ user, closeModal }) => {
  const navigate = useNavigate();
  const [followInfo, setFollowInfo] = useState(null);

  const handleUserClick = () => {
    closeModal();
    navigate(`/${user.username}`);
  };

  useEffect(() => {
    let ignore = false;

    const username = user?.username;
    if (!username) return;

    const fetchFollowInfo = async () => {
      try {
        const res = await profileApi.getProfile(username);
        if (ignore) return;
        setFollowInfo(res);
      } catch (e) {
        console.error('Failed to fetch follow status:', e);
      }
    };

    fetchFollowInfo();
    return () => {
      ignore = true;
    };
  }, [user?.username]);

  const handleToggleFollow = async () => {
    if (!followInfo) return;
    const memberId = followInfo.memberId;
    if (!memberId) return;

    try {
      if (followInfo.isFollowing) {
        const res = await followApi.unfollow(memberId);
        setFollowInfo(prev => ({
          ...prev,
          isFollowing: res.following,
          followerCount: res.followerCount,
        }));
      } else {
        const res = await followApi.follow(memberId);
        setFollowInfo(prev => ({
          ...prev,
          isFollowing: res.following,
          followerCount: res.followerCount,
        }));
      }
    } catch (e) {
      console.error('Failed to toggle follow:', e);
    }
  };

  const shouldShowFollowButton = !!followInfo && !followInfo.isCurrentUser;

  return (
    <header className={styles.postHeader}>
      <div className={styles.postUserInfo}>
        <div className={styles.postProfileImage}>
          <img
            src={user.profileImage ?? user.profileImageUrl}
            alt="Profile"
          />
        </div>
        <span className={styles.postUsername} onClick={handleUserClick}>
          {user.username}
        </span>
      </div>
      <div className={styles.postHeaderRight}>
        {shouldShowFollowButton ? (
          <button
            type="button"
            className={`${styles.followButton} ${followInfo.isFollowing ? styles.following : ''}`}
            onClick={handleToggleFollow}
          >
            {followInfo.isFollowing ? '팔로잉' : '팔로우'}
          </button>
        ) : null}
        <button type="button" className={styles.postOptionsButton}>
          <FaEllipsis />
        </button>
      </div>
    </header>
  );
};

export default PostHeader;
