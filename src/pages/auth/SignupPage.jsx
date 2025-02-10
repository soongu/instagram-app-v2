import AuthCard from "../../components/auth/AuthCard";
import styles from './SignupPage.module.scss';
import {FaFacebookSquare} from "react-icons/fa";
import Separator from "../../components/auth/Separator";
import AppDownload from "../../components/auth/AppDownload";

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

        <form className={styles.authForm} noValidate>
          <div className={styles.formField}>
            <input type="email" name="email"
                   placeholder="휴대폰 번호 또는 이메일 주소" required/>
          </div>

          <div className={styles.formField}>
            <input type="text" name="name"
                   placeholder="성명" required/>
          </div>


          <div className={styles.formField}>
            <input type="text" name="username"
                   placeholder="사용자 이름" required/>
          </div>

          <div className={styles.formField}>
            <div className="input-container">
              <input type="password" name="password"
                     placeholder="비밀번호" required/>
              <button type="button" className={styles.passwordToggle}>패스워드 표시</button>
            </div>
          </div>

          <p className={styles.privacyText}>
            저희 서비스를 이용하는 사람이 회원님의 연락처 정보를 Instagram에 업로드했을 수도 있습니다.
            <a href="#">더 알아보기</a>
          </p>

          <button type="submit" className={styles.authButton}>가입</button>

        </form>
      </AuthCard>

      <AuthCard className={styles.loginCard}>
        <p>계정이 있으신가요? <a href="/">로그인</a></p>
      </AuthCard>

      <AppDownload />
    </>
  );
};

export default SignupPage;