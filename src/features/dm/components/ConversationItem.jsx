import defaultProfileImage from '../../../assets/images/default-profile.svg';
import { formatShortRelative } from '../../../utils/formatter.jsx';
import styles from './ConversationItem.module.scss';

const ConversationItem = ({ conversation, isActive, unreadCount, onClick }) => {
  const {
    otherMemberUsername,
    otherMemberProfileImageUrl,
    lastMessage,
    lastMessageAt,
  } = conversation;

  const previewText = lastMessage ?? '';
  const timeText = formatShortRelative(lastMessageAt);
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatar}>
        <img
          src={otherMemberProfileImageUrl || defaultProfileImage}
          alt={otherMemberUsername}
        />
      </div>
      <div className={styles.body}>
        <span className={styles.username}>{otherMemberUsername}</span>
        <span className={`${styles.preview} ${hasUnread ? styles.unread : ''}`}>
          {previewText && <span className={styles.previewText}>{previewText}</span>}
          {previewText && timeText && <span className={styles.dot}>·</span>}
          {timeText && <span className={styles.time}>{timeText}</span>}
        </span>
      </div>
      {hasUnread && <span className={styles.unreadDot} aria-label={`${unreadCount}개 안 읽음`} />}
    </button>
  );
};

export default ConversationItem;
