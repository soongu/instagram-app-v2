// src/components/auth/Login.jsx
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setToken } from '../../store/authSlice.js';
import { authApi } from '../../services/api';
import Toast from '../common/Toast';
import styles from "../../pages/auth/LoginPage.module.scss";

const Login = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Toast 관련 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    username: location.state?.registeredId || '', // 넘겨받은 아이디로 자동 완성
    password: '',
  });

  useEffect(() => {
    // 회원가입 직후 넘어와서 state에 registeredId가 있다면 Toast 노출
    if (location.state?.registeredId) {
      setToastMessage('가입을 환영합니다! 로그인해주세요.');
      setShowToast(true);
      
      // 새로고침 시 토스트 메시지가 다시 뜨는 것을 방지
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

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
      console.log('Login API Response:', response);
      // API 응답 구조: { success: true, data: { tokens: { accessToken: "..." }, user: { id: 1, username: "..." } } }
      // api.js 인터셉터에서 response.data = response.data.data 로 평탄화를 진행하여
      // response 자체에 객체가 담겨 반환됩니다.
      dispatch(setToken({
        accessToken: response.tokens?.accessToken,
        username: response.user?.username,
        profileImage: response.user?.profileImageUrl
      }));
    } catch (error) {
      // api.js 인터셉터에서 평탄화(error.response.data = error.response.data.error)를 거치므로
      // 여기서 error.response?.data?.message 에 '아이디 또는 비밀번호가 일치하지 않습니다.' 가 담깁니다.
      setError(error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.');
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
      
      {/* 로그인 실패 시 중앙 정렬된 에러 메시지 노출 */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      <button
        type="submit"
        className={styles.authButton}
        disabled={isDisabled}
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>

      {/* 가입 환영 Toast 메시지 출력용 */}
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        duration={5000}
      />
    </form>
  );
};

export default Login;