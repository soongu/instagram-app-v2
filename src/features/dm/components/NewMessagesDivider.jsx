import styles from './NewMessagesDivider.module.scss';

const NewMessagesDivider = () => (
  <div className={styles.wrap}>
    <span className={styles.line} />
    <span className={styles.label}>New messages</span>
    <span className={styles.line} />
  </div>
);

export default NewMessagesDivider;
