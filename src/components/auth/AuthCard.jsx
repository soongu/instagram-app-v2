import InstagramLogo from '../common/InstagramLogo.jsx';
import styles from './AuthCard.module.scss';

const AuthCard = ({ children, className, showLogo = false }) => (
  <div className={`${styles.authCard} ${className}`}>
    {showLogo && (
      <h1 className={styles.logo}>
        <InstagramLogo />
      </h1>
    )}
    {children}
  </div>
);

export default AuthCard;