// src/AppContent.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { authApi } from './services/api';
import { clearToken, setUser, refreshAccessToken } from './store/authSlice.js';
import AppRoutes from './routes/AppRoutes';
import GlobalToast from './components/common/GlobalToast';
import { useStomp } from './lib/websocket/useStomp';

let isReissuingPromise = null;

const AppContent = () => {
  const dispatch = useDispatch();
  const [isInit, setIsInit] = useState(false);

  useStomp();

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        if (!isReissuingPromise) {
          isReissuingPromise = (async () => {
            try {
              const lastRefreshTime = sessionStorage.getItem('lastRefreshTime');
              const now = Date.now();
              if (lastRefreshTime && now - parseInt(lastRefreshTime) < 2000) {
                 console.log('[App 초기화] 너무 잦은 새로고침 감지. 2초 대기 후 시도...');
                 await new Promise(resolve => setTimeout(resolve, 2000));
              }
              sessionStorage.setItem('lastRefreshTime', now.toString());
              
              console.log('[App 초기화] 기존 로그인 유저, Silent Refresh 시도...');
              const response = await authApi.reissue();
              return { success: true, accessToken: response.accessToken };
            } catch (error) {
              return { success: false, error };
            } finally {
              isReissuingPromise = null;
            }
          })();
        }
        
        const result = await isReissuingPromise;
        
        if (isMounted) {
          if (result.success) {
            console.log('[App 초기화] Silent Refresh 성공:', result.accessToken);
            dispatch(refreshAccessToken(result.accessToken));

            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
              dispatch(setUser(JSON.parse(storedUser)));
            }
          } else {
            const error = result.error;
            if (error.name === 'CanceledError' || (error.code && error.code === 'ERR_CANCELED')) {
               console.log('[App 초기화] Silent Refresh 요청이 취소되었습니다.');
            } else {
              console.log('[App 초기화] Silent Refresh 실패 (로그인 만료)', error);
              dispatch(clearToken());
            }
          }
          setIsInit(true);
        }
      } else {
        // 로그인 이력이 없으면 아무것도 하지 않고 초기화 완료
        console.log('[App 초기화] 첫 방문 혹은 로그인 이력 없음, 패스...');
        if (isMounted) {
          setIsInit(true);
        }
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // isInit 이 완료되기 전에는 라우트를 렌더링하지 않아 root 컴포넌트의 잦은 리렌더링과 화면 깜빡임, 스크롤 튀는 현상 방지
  if (!isInit) {
    return null;
  }

  return (
    <>
      <AppRoutes />
      <GlobalToast />
    </>
  );
};

export default AppContent;