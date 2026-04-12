// src/pages/ProfilePage.jsx
import { useLoaderData } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './ProfilePage.module.scss';
import {FaGear} from "react-icons/fa6";
import ProfileImage from "../../components/profile/ProfileImage.jsx";
import ProfileFeed from "../../components/profile/ProfileFeed.jsx";
import { followApi } from "../../services/api.js";
import FollowModal from "../../components/profile/FollowModal/FollowModal.jsx";
import { formatCount } from "../../utils/formatter.jsx";

const ProfilePage = () => {
  // loader에서 불러온 프로필 데이터
  const profileData = useLoaderData();

  const isMyProfile = profileData?.isCurrentUser ?? false;
  
  const initialFollowerCount = profileData?.followStatus?.followerCount ?? profileData?.followerCount ?? 0;
  const initialFollowingCount = profileData?.followStatus?.followingCount ?? profileData?.followingCount ?? 0;
  const initialIsFollowing = profileData?.isFollowing ?? false;
  const postCount = profileData?.postCount ?? profileData?.feedCount ?? 0;

  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  // profileData가 변경될 때 (다른 사용자의 프로필로 클라이언트 라우팅 시) 로컬 State 동기화
  useEffect(() => {
    if (profileData) {
      setFollowerCount(profileData?.followStatus?.followerCount ?? profileData?.followerCount ?? 0);
      setFollowingCount(profileData?.followStatus?.followingCount ?? profileData?.followingCount ?? 0);
      setIsFollowing(profileData?.isFollowing ?? false);
    }
  }, [profileData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('followers'); // 'followers' or 'followings'

  const handleToggleFollow = async () => {
    try {
      if (isFollowing) {
        await followApi.unfollow(profileData.memberId);
        setFollowerCount(prev => prev - 1);
        setIsFollowing(false);
      } else {
        await followApi.follow(profileData.memberId);
        setFollowerCount(prev => prev + 1);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('팔로우 상태 변경 실패', error);
      alert('오류가 발생했습니다.');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const renderActionButtons = () => {
    if (isMyProfile) {
      return (
        <>
          <button className={styles.profileEditButton}>
            프로필 편집
          </button>
          <button className={styles.settingsButton}>
            <FaGear/>
          </button>
        </>
      );
    }

    // 내 프로필이 아닌 경우 기본 형태만 렌더링
    return (
      <>
        <button 
          className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
          onClick={handleToggleFollow}
        >
          {isFollowing ? '팔로잉' : '팔로우'}
        </button>
        <button className={styles.messageButton}>
          메시지 보내기
        </button>
      </>
    );

  }

  // profileData가 없으면(인증 실패 등) 안전하게 렌더링을 중단합니다.
  if (!profileData) return null;

  return (
    <main className={styles.profileMain}>
      {/* 프로필 헤더 */}
      <header className={styles.profileHeader}>
        {/* 프로필 이미지 영역 */}
        <ProfileImage
          imageUrl={profileData.profileImageUrl}
          username={profileData.username}
          editable={isMyProfile}
        />

        {/* 프로필 정보 영역 */}
        <div className={styles.profileInfo}>
          <div className={styles.profileActions}>
            <h2 className={styles.username}>{profileData.username}</h2>
            <div className={styles.actionButtons}>
              {renderActionButtons()}
            </div>
          </div>

          {/* 통계 정보 */}
          <ul className={styles.profileStats}>
            <li>
              게시물 <span className={styles.statsNumber}>{formatCount(postCount)}</span>
            </li>
            <li onClick={() => openModal('followers')} style={{ cursor: 'pointer' }}>
              팔로워 <span className={styles.statsNumber}>{formatCount(followerCount)}</span>
            </li>
            <li onClick={() => openModal('followings')} style={{ cursor: 'pointer' }}>
              팔로우 <span className={styles.statsNumber}>{formatCount(followingCount)}</span>
            </li>
          </ul>

          <div className={styles.profileBio}>
            <span className={styles.fullName}>{profileData.name}</span>
          </div>
        </div>
      </header>

      {/* 게시물 목록 */}
      <ProfileFeed username={profileData.username} />

      {/* 팔로우 모달 */}
      <FollowModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        memberId={profileData.memberId}
        currentUsername={profileData.username}
      />
    </main>
  );
};

export default ProfilePage;