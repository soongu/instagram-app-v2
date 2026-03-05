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

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    // ApiResponse<T> 형식인지 확인
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        response.data = response.data.data;
      } else {
        // HTTP 200 OK 이지만 비즈니스 로직 실패인 경우
        const error = new Error(response.data.error?.message || '요청 처리에 실패했습니다.');
        error.response = {
          data: response.data.error,
          status: response.data.error?.status || response.status
        };
        return Promise.reject(error);
      }
    }
    return response;
  },
  (error) => {
    // HTTP 상태 코드가 4xx, 5xx 에러인 경우
    if (error.response?.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
      // 기존 컴포넌트 에러 처리(error.response.data.message 등)와 호환되도록 에러 데이터 구조 평탄화
      error.response.data = error.response.data.error || error.response.data;
    }
    return Promise.reject(error);
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

export const postApi = {
  // 특정 사용자의 게시물 목록 가져오기 (프로필 페이지)
  getProfilePosts: (username) => api.get(`/profiles/${username}/posts`),

  // 특정 해시태그의 게시물 목록 가져오기 (해시태그 검색 페이지)
  getPostsByHashtag: (hashtag) => api.get(`/hashtags/${hashtag}/posts`),

  // 개별 게시물 상세 정보 가져오기 (모달용)
  getPost: (postId) => api.get(`/posts/${postId}`)
};

// 좋아요 관련 API 추가
export const likeApi = {
  // 특정 게시물 좋아요 토글
  toggleLike: (feedId) => api.post(`/posts/${feedId}/likes`),

};

// 댓글 관련 API
export const commentApi = {
  addComment: (feedId, payload) => api.post(`/posts/${feedId}/comments`, payload),
};