import { useEffect, useRef, useState } from 'react';
import { FaRegFaceSmile, FaMicrophone, FaImage } from 'react-icons/fa6';
import { send as stompSend } from '../../../lib/websocket/stompClient';
import styles from './MessageInput.module.scss';

// 상대방에게 "입력 중" 신호를 3초마다 유지. 3초 inactivity 시 stop, send 시에도 stop.
const TYPING_STOP_DELAY_MS = 3000;

const sendTyping = (conversationId, typing) => {
  if (!conversationId) return;
  stompSend('/app/dm.typing', { conversationId, typing });
};

const MessageInput = ({ onSend, disabled, conversationId }) => {
  const [value, setValue] = useState('');

  // 현재 "입력 중" 상태로 서버에 알린 값 — 동일 상태 반복 전송 방지 (스팸 방지)
  const lastSentTypingRef = useRef(false);
  // inactivity 타이머 핸들
  const stopTimerRef = useRef(null);

  const clearStopTimer = () => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const setTyping = (typing) => {
    if (lastSentTypingRef.current === typing) return;
    lastSentTypingRef.current = typing;
    sendTyping(conversationId, typing);
  };

  // 대화방이 바뀌거나 언마운트되면, 이전 대화방에 typing:false 전송
  useEffect(() => {
    return () => {
      clearStopTimer();
      if (lastSentTypingRef.current) {
        sendTyping(conversationId, false);
        lastSentTypingRef.current = false;
      }
    };
  }, [conversationId]);

  const armStopTimer = () => {
    clearStopTimer();
    stopTimerRef.current = setTimeout(() => {
      setTyping(false);
      stopTimerRef.current = null;
    }, TYPING_STOP_DELAY_MS);
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);

    if (next.length > 0) {
      setTyping(true);
      armStopTimer();
    } else {
      clearStopTimer();
      setTyping(false);
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    const ok = onSend?.(trimmed);
    if (ok !== false) {
      setValue('');
      clearStopTimer();
      setTyping(false);
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
