import AuthCard from "../../components/auth/AuthCard";
import styles from './SignupPage.module.scss';
import {FaFacebookSquare} from "react-icons/fa";
import Separator from "../../components/auth/Separator";
import AppDownload from "../../components/auth/AppDownload";
import Signup from "../../components/auth/Signup";

const SignupPage = () => {
  return (
    <>
      <AuthCard showLogo={true}>
        <p className={styles.signupText}>친구들의 사진과 동영상을 보려면 가입하세요.</p>

        <button className={styles.facebookButton}>
          <FaFacebookSquare/>
          Facebook으로 로그인
        </button>

        <Separator/>

        <Signup />
      </AuthCard>

      <AuthCard className={styles.loginCard}>
        <p>계정이 있으신가요? <a href="/">로그인</a></p>
      </AuthCard>

      <AppDownload />
    </>
  );
};

export default SignupPage;