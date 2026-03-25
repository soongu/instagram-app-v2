// src/components/posts/PostHeader.jsx
import { FaEllipsis } from 'react-icons/fa6';
import { useNavigate } from "react-router-dom";
import styles from './PostDetailModal.module.scss';

const PostHeader = ({ user, closeModal }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    closeModal();
    navigate(`/${user.username}`);
  };

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
      <button type="button" className={styles.postOptionsButton}>
        <FaEllipsis />
      </button>
    </header>
  );
};

export default PostHeader;
