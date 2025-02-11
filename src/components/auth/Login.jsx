// src/components/auth/Login.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from '../../features/auth/authSlice';
import { authApi } from '../../services/api';
import styles from "../../pages/auth/LoginPage.module.scss";

const Login = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    // 에러 메시지 초기화
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(formData);
      dispatch(setToken(response.data.accessToken));
    } catch (error) {
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !formData.username || !formData.password || isLoading;

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
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <button
        type="submit"
        className={styles.authButton}
        disabled={isDisabled}
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};

export default Login;