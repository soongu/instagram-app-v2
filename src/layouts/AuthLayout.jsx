import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.scss';
import authPhoneImage from '../assets/images/auth/phones.png';

const AuthLayout = () => (
  <main className={styles.authLayout}>
    <div className={styles.authImage}>
      <img src={authPhoneImage} alt="Instagram 앱 스크린샷"/>
    </div>
    <div className={styles.authFormContainer}>
      <Outlet/>
    </div>
  </main>
);

export default AuthLayout;