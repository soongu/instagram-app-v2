// services/api.js
import axios from 'axios';


// axios 인스턴스 생성
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 관련 API
export const authApi = {
  // 이메일 중복 확인
  checkDuplicate: (type, value) => api.get(`/auth/check-duplicate?type=${type}&value=${value}`),

  // 회원가입 요청
  signup: (userData) => api.post('/auth/signup', userData),

  // 로그인 요청
  login: (credentials) => api.post('/auth/login', credentials),
  // 로그아웃 요청
  logout: () => api.post('/auth/logout'),
};