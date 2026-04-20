// /user/queue/notifications 로 도착한 알림을 NotificationPanel 이 (열려있다면) prepend 할 수 있도록
// 전달하는 얇은 이벤트 버스. 목록 자체는 패널의 local state 로 유지한다.

const listeners = new Set();

export const emitNotificationReceived = (notification) => {
  listeners.forEach((cb) => {
    try {
      cb(notification);
    } catch (err) {
      console.error('[Notifications] listener threw:', err);
    }
  });
};

export const onNotificationReceived = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
