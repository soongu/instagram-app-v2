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

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

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
    const isAuthEndpoint = ['/auth/reissue', '/auth/login', '/auth/signup'].includes(originalRequest.url);
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('[Axios Interceptor] Access Token 만료 감지, 재발급 갱신 시도...');
        const response = await authApi.reissue();
        const newAccessToken = response.accessToken;
        
        console.log('[Axios Interceptor] 토큰 갱신 성공:', newAccessToken);
        store.dispatch(refreshAccessToken(newAccessToken));
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        onRefreshed(newAccessToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[Axios Interceptor] 토큰 재발급 실패. 로그아웃 처리');
        store.dispatch(clearToken());
        onRefreshed(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

let globalReissuePromise = null;

// 인증 관련 API
export const authApi = {
  // 이메일 중복 확인
  checkDuplicate: (type, value) => api.get(`/auth/check-duplicate?type=${type}&value=${value}`),

  // 회원가입 요청
  signup: (userData) => api.post('/auth/signup', userData),

  // 로그인 요청
  login: (credentials) => api.post('/auth/login', credentials),

  // 토큰 재발급 요청 (Silent Refresh)
  reissue: () => {
    if (!globalReissuePromise) {
      globalReissuePromise = api.post('/auth/reissue', {}, { withCredentials: true })
        .finally(() => {
          globalReissuePromise = null;
        });
    }
    return globalReissuePromise;
  },

  // 로그아웃 요청
  logout: () => api.post('/auth/logout'),
};

// 피드 관련 API
export const feedApi = {
  getFeedPosts: (cursor, size = 5) =>
    api.get(`/posts/cursor?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),
};

export const profileApi = {
  // 프로필 헤더 정보 조회
  getProfile: (username) =>
    api.get(`/profiles/${username}`),

  // 프로필 피드 목록 조회
  getProfilePosts: (username, cursor, size = 12) =>
    api.get(`/profiles/${username}/posts?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),

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
  getProfilePosts: (username, cursor, size = 12) =>
    api.get(`/profiles/${username}/posts?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),

  // 특정 해시태그의 게시물 목록 가져오기 (해시태그 검색 페이지, SliceResponse)
  getPostsByHashtag: (hashtag, cursor, size = 12) =>
    api.get(`/hashtags/${encodeURIComponent(hashtag)}/posts?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),

  // 개별 게시물 상세 정보 가져오기 (모달용)
  // context="profile"일 때만 prevPostId/nextPostId가 채워질 수 있음
  getPost: (postId, context) => api.get(`/posts/${postId}${context ? `?context=${context}` : ''}`),

  // 원댓글 목록 조회(대댓글은 별도 엔드포인트)
  getPostComments: (postId, cursor, size = 20) =>
    api.get(`/posts/${postId}/comments?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),

  // 게시물 생성 (멀티파트 폼 데이터)
  createPost: (formData) => api.post(`/posts`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// 해시태그 관련 API 추가
export const hashtagApi = {
  /** @returns {Promise<Array<{ hashtagName: string, postCount: number }>>} */
  getSuggestions: (prefix, limit = 10) =>
    api.get(`/hashtags/suggestions?prefix=${encodeURIComponent(prefix)}&limit=${limit}`),
};

// 좋아요 관련 API 추가
export const likeApi = {
  // 특정 게시물 좋아요 토글
  toggleLike: (feedId) => api.post(`/posts/${feedId}/likes`),

};

// 댓글 관련 API
export const commentApi = {
  addComment: (feedId, payload) => api.post(`/posts/${feedId}/comments`, payload),
  getReplies: (postId, rootCommentId, cursor, size = 10) =>
    api.get(`/posts/${postId}/comments/${rootCommentId}/replies?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),
};

// 팔로우 관련 API
export const followApi = {
  // 팔로우
  follow: (memberId) => api.post(`/members/${memberId}/follow`),
  // 언팔로우
  unfollow: (memberId) => api.delete(`/members/${memberId}/follow`),
  // 팔로워 목록
  getFollowers: (memberId, cursor, size = 20) =>
    api.get(`/members/${memberId}/followers?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),
  // 팔로잉 목록
  getFollowings: (memberId, cursor, size = 20) =>
    api.get(`/members/${memberId}/followings?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),
};

// 알림 관련 API
export const notificationApi = {
  getNotifications: (cursor, size = 20, type, isRead) => {
    let url = `/notifications?size=${size}`;
    if (cursor) url += `&cursor=${cursor}`;
    if (type) url += `&type=${type}`;
    if (isRead !== undefined && isRead !== null) url += `&isRead=${isRead}`;
    return api.get(url);
  },
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

// 회원 검색 API
export const memberApi = {
  search: (keyword, cursor, size = 20) =>
    api.get(`/members/search?keyword=${encodeURIComponent(keyword)}&size=${size}${cursor ? `&cursor=${cursor}` : ''}`),
};

// DM 대화방 / 메시지 API
export const conversationApi = {
  // 내 대화방 목록
  list: () => api.get('/conversations'),

  // 1:1 대화방 생성 (또는 기존 반환)
  createOrGet: (targetMemberId) => api.post(`/conversations/${targetMemberId}`),

  // 대화방 삭제 (나가기)
  remove: (conversationId) => api.delete(`/conversations/${conversationId}`),

  // 메시지 이력 (커서 기반, 최신→과거)
  getMessages: (conversationId, cursor, size = 20) => {
    let url = `/conversations/${conversationId}/messages?size=${size}`;
    if (cursor) url += `&cursor=${cursor}`;
    return api.get(url);
  },

  // 대화방 진입 시 상대방 메시지 일괄 읽음 처리
  markAllRead: (conversationId) =>
    api.patch(`/conversations/${conversationId}/messages/read`),
};