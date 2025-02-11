import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';
import styles from "../../pages/auth/LoginPage.module.scss";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginUser(formData));
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const isDisabled = !formData.username || !formData.password || status === 'loading';

  return (
    <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.formField}>
        <input
          type="text"
          name="username"
          placeholder="전화번호, 사용자 이름 또는 이메일"
          required
          value={formData.username}
          onChange={handleChange}
          disabled={status === 'loading'}
        />
      </div>
      <div className={styles.formField}>
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          required
          value={formData.password}
          onChange={handleChange}
          disabled={status === 'loading'}
        />
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <button
        type="submit"
        className={styles.authButton}
        disabled={isDisabled}
      >
        {status === 'loading' ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};

export default Login;