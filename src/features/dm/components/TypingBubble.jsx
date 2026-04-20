import defaultProfileImage from '../../../assets/images/default-profile.svg';
import styles from './TypingBubble.module.scss';

const TypingBubble = ({ avatarUrl }) => (
  <div className={styles.row}>
    <div className={styles.avatarSlot}>
      <img
        src={avatarUrl || defaultProfileImage}
        alt=""
        className={styles.avatar}
      />
    </div>
    <div className={styles.bubble} aria-label="입력 중">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  </div>
);

export default TypingBubble;
