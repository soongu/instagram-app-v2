import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.scss';
import PhoneImage from "../assets/images/auth/phones.png";

const AuthLayout = ({ isLoginPage }) => {

  return (
    <main className={styles.authLayout}>

      {
        isLoginPage &&
        <div className={styles.authImage}>
          <img src={PhoneImage} alt="Instagram 앱 스크린샷"/>
        </div>
      }

      <div className={styles.authFormContainer}>
        <Outlet/>
      </div>
    </main>
  );
}

export default AuthLayout;