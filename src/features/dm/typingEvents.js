// /user/queue/dm-typing 수신 → 해당 대화방의 MessagePane 으로 전달하는 얇은 이벤트 버스.
// typing 은 휘발성 이벤트 (DB 미저장, 복구 대상 아님) 이므로 이 버스도 완전히 in-memory.

const listeners = new Set();

export const emitTypingReceived = (payload) => {
  listeners.forEach((cb) => {
    try {
      cb(payload);
    } catch (err) {
      console.error('[Typing] listener threw:', err);
    }
  });
};

export const onTypingReceived = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
