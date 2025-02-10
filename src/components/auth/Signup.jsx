// Signup.jsx
import {useState} from 'react';
import styles from '../../pages/auth/SignupPage.module.scss';
import {ValidationRules, checkPasswordStrength} from "../../utils/ValidationRules";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 회원가입 요청
  };

  return (
    <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.formField}>
        <input
          type="email"
          name="email"
          placeholder="휴대폰 번호 또는 이메일 주소"
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formField}>
        <input
          type="text"
          name="name"
          placeholder="성명"
          required
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formField}>
        <input
          type="text"
          name="username"
          placeholder="사용자 이름"
          required
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formField}>
        <div className="input-container">
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button type="button" className={styles.passwordToggle}>패스워드 표시</button>
        </div>
      </div>

      <p className={styles.privacyText}>
        저희 서비스를 이용하는 사람이 회원님의 연락처 정보를 Instagram에 업로드했을 수도 있습니다.
        <a href="#">더 알아보기</a>
      </p>

      <button type="submit" className={styles.authButton}>가입</button>

    </form>
  );
}

export default Signup;