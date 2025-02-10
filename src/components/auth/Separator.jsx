import styles from './Separator.module.scss';

const Separator = () => (
  <div className={styles.separator}>
    <div className={styles.line}/>
    <div className={styles.text}>또는</div>
    <div className={styles.line}/>
  </div>
);

export default Separator;