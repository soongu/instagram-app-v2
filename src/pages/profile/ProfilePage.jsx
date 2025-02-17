// src/pages/ProfilePage.jsx
import { useLoaderData } from 'react-router-dom';
import styles from './ProfilePage.module.scss';
import {useIsMyProfile} from "../../hooks/useIsMyProfile.js";
import {FaGear} from "react-icons/fa6";
import ProfileImage from "../../components/profile/ProfileImage.jsx";

const ProfilePage = () => {
  // loader에서 불러온 프로필 데이터
  const profileData = useLoaderData();
  const isMyProfile = useIsMyProfile();

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
        <button className={styles.followButton}>
          팔로우
        </button>
        <button className={styles.messageButton}>
          메시지 보내기
        </button>
      </>
    );

  }

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
              게시물 <span className={styles.statsNumber}>{profileData.feedCount}</span>
            </li>
            <li>
              팔로워 <span className={styles.statsNumber}>{profileData.followStatus.followerCount}</span>
            </li>
            <li>
              팔로우 <span className={styles.statsNumber}>{profileData.followStatus.followingCount}</span>
            </li>
          </ul>

          <div className={styles.profileBio}>
            <span className={styles.fullName}>{profileData.name}</span>
          </div>
        </div>
      </header>

      {/* 피드 그리드 - 우선 비워둠 */}
    </main>
  );
};

export default ProfilePage;