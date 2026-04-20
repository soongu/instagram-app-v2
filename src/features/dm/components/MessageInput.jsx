import { useEffect, useRef, useState } from 'react';
import { FaRegFaceSmile, FaMicrophone, FaImage } from 'react-icons/fa6';
import { send as stompSend } from '../../../lib/websocket/stompClient';
import styles from './MessageInput.module.scss';

// 3초 inactivity 에 typing:false, 그 이전에는 3초 주기로 typing:true 하트비트를 다시 발사.
// 수신 측 TTL 이 5초 이므로 3초 하트비트면 상대가 계속 치는 동안 버블이 유지된다.
const TYPING_STOP_DELAY_MS = 3000;
const TYPING_HEARTBEAT_MS = 3000;

const sendTyping = (conversationId, typing) => {
  if (!conversationId) return;
  stompSend('/app/dm.typing', { conversationId, typing });
};

const MessageInput = ({ onSend, disabled, conversationId }) => {
  const [value, setValue] = useState('');

  // 현재 상대에게 "타이핑 중" 임을 알리고 있는지
  const isTypingOnRef = useRef(false);
  // 마지막으로 typing:true 를 보낸 시각 (하트비트 레이트리밋)
  const lastTypingSentAtRef = useRef(0);
  // inactivity 타이머 핸들
  const stopTimerRef = useRef(null);

  const clearStopTimer = () => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const sendTypingOn = () => {
    // 최소 TYPING_HEARTBEAT_MS 간격으로만 실제 전송 (스팸 방지)
    const now = Date.now();
    if (now - lastTypingSentAtRef.current < TYPING_HEARTBEAT_MS) return;
    lastTypingSentAtRef.current = now;
    isTypingOnRef.current = true;
    sendTyping(conversationId, true);
  };

  const sendTypingOff = () => {
    if (!isTypingOnRef.current) return;
    isTypingOnRef.current = false;
    lastTypingSentAtRef.current = 0;
    sendTyping(conversationId, false);
  };

  // 대화방이 바뀌거나 언마운트되면, 이전 대화방에 typing:false 전송
  useEffect(() => {
    return () => {
      clearStopTimer();
      sendTypingOff();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const armStopTimer = () => {
    clearStopTimer();
    stopTimerRef.current = setTimeout(() => {
      sendTypingOff();
      stopTimerRef.current = null;
    }, TYPING_STOP_DELAY_MS);
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);

    if (next.length > 0) {
      // 키 입력마다 heartbeat 레이트리밋 체크 후 typing:true 재송신
      sendTypingOn();
      armStopTimer();
    } else {
      clearStopTimer();
      sendTypingOff();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    const ok = onSend?.(trimmed);
    if (ok !== false) {
      setValue('');
      clearStopTimer();
      sendTypingOff();
    }
  };

  const handleKeyDown = (e) => {
    // 한글(IME) 조합 중 Enter 는 조합 완료용이므로 무시 — 그렇지 않으면 한 번 더 눌릴 때 같은 문장이
    // 두 번 전송된다. nativeEvent.isComposing / keyCode 229 는 같은 조건을 가리키는 표준 신호.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className={styles.container}>
      <button type="button" className={styles.iconButton} aria-label="이모지">
        <FaRegFaceSmile size={24} />
      </button>
      <input
        type="text"
        className={styles.input}
        placeholder="메시지 입력..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      {hasText ? (
        <button
          type="button"
          className={styles.sendButton}
          onClick={submit}
          disabled={disabled}
        >
          보내기
        </button>
      ) : (
        <>
          <button type="button" className={styles.iconButton} aria-label="음성">
            <FaMicrophone size={22} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="이미지">
            <FaImage size={22} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="스티커">
            <FaRegFaceSmile size={22} />
          </button>
        </>
      )}
    </div>
  );
};

export default MessageInput;
