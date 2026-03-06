// src/services/api.js
import axios from 'axios';
import {store} from "../store/index";
import { refreshAccessToken, clearToken } from '../store/authSlice';


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
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    // HTTP 401 에러(토큰 만료 등)이고 재시도한 적이 없으며, reissue 요청이 아닌 경우에만 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/reissue') {
      originalRequest._retry = true;
      try {
        console.log('[Axios Interceptor] Access Token 만료 감지, 재발급 갱신 시도...');
        const response = await authApi.reissue();
        // 앞선 응답 인터셉터 처리를 통해 이미 response = { accessToken: "..." } 형태입니다.
        const newAccessToken = response.accessToken;
        
        console.log('[Axios Interceptor] 토큰 갱신 성공:', newAccessToken);
        // Redux 스토어에 새 토큰 저장
        store.dispatch(refreshAccessToken(newAccessToken));
        
        // 원래 요청 헤더 갱신 후 재요청
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[Axios Interceptor] 토큰 재발급 실패. 로그아웃 처리');
        store.dispatch(clearToken());
        return Promise.reject(refreshError);
      }
    }

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

  // 토큰 재발급 요청 (Silent Refresh)
  reissue: () => api.post('/auth/reissue', {}, { withCredentials: true }),

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