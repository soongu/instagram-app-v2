import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { subscribe } from './stompClient';
import { showToast } from '../../store/toastSlice';

// 백엔드 StompExceptionAdvice (`@ControllerAdvice` + `@MessageExceptionHandler`)
// 가 STOMP @MessageMapping 컨트롤러에서 던져진 BusinessException / RateLimitException
// 을 이 큐로 변환해 보낸다.
//
// HTTP 측의 GlobalExceptionHandler 와 짝꿍 — HTTP 응답은 axios 인터셉터가 받지만,
// STOMP 쪽 예외는 별도 메시지 채널로 와야 토스트에 띄울 수 있다.
const ERRORS_QUEUE = '/user/queue/errors';
const RATE_LIMIT_CODE = 'R001';

const formatMessage = (payload) => {
  if (!payload || !payload.message) return '요청 처리에 실패했습니다.';
  if (payload.code === RATE_LIMIT_CODE && payload.retryAfterSeconds) {
    return `${payload.message} (${payload.retryAfterSeconds}초 후 다시 시도해주세요)`;
  }
  return payload.message;
};

// App 루트에서 한 번만 호출.
// stompClient 내부 재연결 시 자동 rebind 되므로 별도 재구독 로직 불필요.
export const useStompErrorRealtime = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = subscribe(ERRORS_QUEUE, (payload) => {
      dispatch(showToast({
        message: formatMessage(payload),
        type: 'error',
      }));
    });
    return unsubscribe;
  }, [dispatch]);
};
