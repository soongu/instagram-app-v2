import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { connect, disconnect } from './stompClient';

// App 루트에서 한 번만 호출. 로그인 토큰이 세팅되면 STOMP 연결,
// 로그아웃되면 연결을 종료한다. 토큰이 갱신되면(재발급) 연결도 재수립한다.
export const useStomp = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (accessToken) {
      connect(accessToken);
    } else {
      disconnect();
    }
  }, [accessToken]);
};
