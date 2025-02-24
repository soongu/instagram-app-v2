// src/components/feed/FeedItemContent.jsx
import { useState } from "react";
import styles from "./FeedItem.module.scss";
import { convertHashtagsToJsx, formatDate } from "../../../utils/formatter.jsx";
import {Link} from "react-router-dom";

const FeedItemContent = ({ username, content, createdAt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const TEXT_LIMIT = 30;

  return (
    <div className={styles.text}>
      <Link to={`/${username}`} className={styles.username}>
        {username}
      </Link>
      {isExpanded || content.length <= TEXT_LIMIT ? (
        <span className={styles.caption}>{convertHashtagsToJsx(content)}</span>
      ) : (
        <>
          <span className={styles.caption}>{convertHashtagsToJsx(content.slice(0, TEXT_LIMIT))}...</span>
          <button className={styles.moreButton} onClick={() => setIsExpanded(true)}>
            더 보기
          </button>
        </>
      )}
      <div className={styles.time}>{formatDate(createdAt)}</div>
    </div>
  );
};

export default FeedItemContent;
