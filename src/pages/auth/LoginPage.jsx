import styles from './LoginPage.module.scss';
import AuthCard from "../../components/auth/AuthCard";
import {Link} from "react-router-dom";
import AppDownload from "../../components/auth/AppDownload";
import Separator from "../../components/auth/Separator";
import {FaFacebookSquare} from "react-icons/fa";


const LoginPage = () => {

  return (
    <>
      {/* 첫 번째 카드에만 로고 표시 */}
      <AuthCard showLogo={true}>
        <form className={styles.authForm}>
          <div className={styles.formField}>
            <input
              type="text"
              name="username"
              placeholder="전화번호, 사용자 이름 또는 이메일"
              required
            />
          </div>
          <div className={styles.formField}>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              required
            />
          </div>
          <button type="submit" className={styles.authButton}>
            로그인
          </button>
        </form>

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