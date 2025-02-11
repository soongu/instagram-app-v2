import styles from "../../pages/auth/LoginPage.module.scss";

const Login = () => {
  return (
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
  );
};

export default Login;