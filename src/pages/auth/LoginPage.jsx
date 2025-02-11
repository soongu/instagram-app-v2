import styles from './LoginPage.module.scss';
import AuthCard from "../../components/auth/AuthCard";
import {Link} from "react-router-dom";
import AppDownload from "../../components/auth/AppDownload";
import Separator from "../../components/auth/Separator";
import {FaFacebookSquare} from "react-icons/fa";
import Login from "../../components/auth/Login.jsx";


const LoginPage = () => {

  return (
    <>
      {/* 첫 번째 카드에만 로고 표시 */}
      <AuthCard showLogo={true}>

        <Login />

        <Separator/>

        <a href="#" className={styles.facebookLogin}>
          <FaFacebookSquare/>
          Facebook으로 로그인
        </a>

        <Link to="#" className={styles.forgotPassword}>
          비밀번호를 잊으셨나요?
        </Link>

      </AuthCard>


      <AuthCard className={styles.signupCard}>
        <p>
          계정이 없으신가요? <Link to="/signup">가입하기</Link>
        </p>
      </AuthCard>

      <AppDownload/>
    </>
  );
}

export default LoginPage;