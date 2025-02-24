// src/components/feed/FeedItemHeader.jsx
import { Link } from "react-router-dom";
import { FaEllipsis } from "react-icons/fa6";
import styles from "./FeedItem.module.scss";
import defaultProfileImage from "../../../assets/images/default-profile.svg";

const FeedItemHeader = ({ username, profileImage }) => {
  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <Link to={`/${username}`} className={styles.profileLink}>
          <div className={styles.profileImage}>
            <img src={profileImage || defaultProfileImage} alt={`${username}의 프로필`} />
          </div>
        </Link>
        <div className={styles.userDetails}>
          <Link to={`/${username}`} className={styles.username}>
            {username}
          </Link>
        </div>
      </div>
      <button className={styles.optionsButton}>
        <FaEllipsis />
      </button>
    </header>
  );
};

export default FeedItemHeader;
