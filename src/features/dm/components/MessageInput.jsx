import { useState } from 'react';
import { FaRegFaceSmile, FaMicrophone, FaImage } from 'react-icons/fa6';
import styles from './MessageInput.module.scss';

const MessageInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    const ok = onSend?.(trimmed);
    if (ok !== false) setValue('');
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
        onChange={(e) => setValue(e.target.value)}
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
