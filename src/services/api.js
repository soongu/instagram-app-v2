// src/services/api.js
import axios from 'axios';
import {store} from "../store/index";


// axios 인스턴스 생성
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

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

  // 현재 로그인한 사용자 정보 조회 API 추가
  getCurrentUser: () => api.get('/profiles/me'),
};

// 피드 관련 API
export const feedApi = {
  getFeedPosts: (page) => api.get(`/posts?page=${page}`)
};

export const profileApi = {
  // 프로필 헤더 정보 조회
  getProfile: (username) =>
    api.get(`/profiles/${username}`),

  // 프로필 피드 목록 조회
  getProfilePosts: (username) =>
    api.get(`/profiles/${username}/posts`),

  // 프로필 이미지 업데이트
  updateProfileImage: (formData) =>
    api.put('/profiles/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

};