// components/profile/ProfileImage.jsx

import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProfileImage.module.scss';
import defaultProfileImage from '../../assets/images/default-profile.svg';
import { updateProfileImage } from '../../store/authSlice.js';
import { showToast } from '../../store/toastSlice.js';
import { profileApi } from '../../services/api.js';

const ProfileImage = ({imageUrl, username, editable}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // 내 프로필일 경우에만 Redux store의 정보 사용
  const myProfileInfo = useSelector(state => state.auth.user);

  // editable이 true일 경우(내 프로필) Redux store의 정보 사용,
  // 아닐 경우 props로 전달받은 정보 사용
  const profileImageToShow = editable ? myProfileInfo?.profileImage : imageUrl;
  const usernameToShow = editable ? myProfileInfo?.username : username;

  const handleImageClick = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      dispatch(showToast('이미지 파일만 업로드 가능합니다.'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      dispatch(showToast('파일 크기는 10MB 이하여야 합니다.'));
      return;
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      // 프로필 이미지 업데이트 API 호출
      const response = await profileApi.updateProfileImage(formData);
      const {imageUrl} = response.data;

      // Redux store의 프로필 정보 업데이트
      dispatch(updateProfileImage(imageUrl));
    } catch (error) {
      dispatch(showToast('프로필 사진 업데이트에 실패했습니다.'));
    }
  };

  return (
    <div className={styles.profileImageContainer}>
      <div
        className={`${styles.profileImage} ${editable ? styles.editable : ''}`}
        onClick={handleImageClick}
      >
        <img
          src={profileImageToShow || defaultProfileImage}
          alt={`${usernameToShow}의 프로필`}
        />
      </div>
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{display: 'none'}}
        />
      )}
    </div>
  );
};

export default ProfileImage;