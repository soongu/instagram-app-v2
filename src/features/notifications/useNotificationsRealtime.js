import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribe } from '../../lib/websocket/stompClient';
import { notificationApi } from '../../services/api';
import {
  incrementUnreadCount,
  setUnreadCount,
} from '../../store/notificationsSlice';
import { emitNotificationReceived } from './notificationEvents';

const NOTIFICATIONS_QUEUE = '/user/queue/notifications';

// App 루트에서 한 번 호출:
// 1) 로그인 직후 안 읽은 알림 수를 한 번 REST 로 조회해 뱃지 초기값 세팅
// 2) /user/queue/notifications 구독 → 도착 시 뱃지 + (열려있는) 패널에 전달
//    연결이 끊겨있을 때 도착한 알림은 stompClient 재연결 후 재구독되지만,
//    DB 에 저장된 알림을 REST 로 한번 다시 조회하여 갭을 복구한다.
export const useNotificationsRealtime = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);

  // 로그인/재발급 시 안 읽은 알림 수 초기화
  useEffect(() => {
    if (!accessToken) {
      dispatch(setUnreadCount(0));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await notificationApi.getNotifications(null, 50, null, false);
        const items = res?.items ?? [];
        if (!cancelled) dispatch(setUnreadCount(items.length));
      } catch (err) {
        console.warn('[Notifications] 초기 unread count 조회 실패:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, dispatch]);

  // 실시간 알림 구독
  useEffect(() => {
    const unsubscribe = subscribe(NOTIFICATIONS_QUEUE, (notification) => {
      if (!notification) return;
      emitNotificationReceived(notification);
      if (!notification.isRead) {
        dispatch(incrementUnreadCount());
      }
    });
    return unsubscribe;
  }, [dispatch]);
};
