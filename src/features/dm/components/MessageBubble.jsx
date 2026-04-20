import defaultProfileImage from '../../../assets/images/default-profile.svg';
import styles from './MessageBubble.module.scss';

const MessageBubble = ({
  message,
  isMine,
  showAvatar,
  avatarUrl,
  position,
}) => {
  const positionClass = styles[`pos-${position}`] || '';

  return (
    <div className={`${styles.row} ${isMine ? styles.mine : styles.other}`}>
      {!isMine && (
        <div className={styles.avatarSlot}>
          {showAvatar && (
            <img
              src={avatarUrl || defaultProfileImage}
              alt=""
              className={styles.avatar}
            />
          )}
        </div>
      )}
      <div
        className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleOther} ${positionClass}`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
