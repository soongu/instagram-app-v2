import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { subscribe } from '../../lib/websocket/stompClient';
import { incrementUnread } from '../../store/dmSlice';
import { emitDmReceived } from './dmEvents';

const DM_QUEUE = '/user/queue/dm';

// App 루트에서 한 번만 호출.
// /user/queue/dm 수신 → dmEvents 버스로 전달 + 현재 열려있지 않은 대화방은 unread 증가.
// stompClient 내부에서 (재)연결 시 자동으로 rebind 되므로 별도 재구독 로직은 불필요.
export const useDmRealtime = () => {
  const store = useStore();

  useEffect(() => {
    const unsubscribe = subscribe(DM_QUEUE, (message) => {
      if (!message || !message.conversationId) return;

      emitDmReceived(message);

      const state = store.getState();
      const myUsername = state.auth.user?.username;
      const selectedId = state.dm.selectedConversationId;
      const isMine = message.senderUsername === myUsername;

      if (!isMine && message.conversationId !== selectedId) {
        store.dispatch(incrementUnread(message.conversationId));
      }
    });

    return unsubscribe;
  }, [store]);
};
