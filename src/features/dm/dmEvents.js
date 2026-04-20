// DM 실시간 수신 → MessagePane 사이의 얇은 이벤트 버스.
// Redux 로 메시지를 전부 끌어올리면 정상적으로 동작하지만,
// 메시지 이력은 MessagePane 의 local state 로 유지하고 있으므로
// Push 도달 시점에만 이 버스로 전달해 필요한 리스너가 반응한다.

const listeners = new Set();

export const emitDmReceived = (message) => {
  listeners.forEach((cb) => {
    try {
      cb(message);
    } catch (err) {
      console.error('[DM] listener threw:', err);
    }
  });
};

export const onDmReceived = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
