// src/components/common/Toast.jsx
import { useEffect } from 'react';
import styles from './Toast.module.scss';

const Toast = ({ message, isVisible, onClose, duration = 3000, variant = 'default' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const contentClass = variant === 'error'
    ? `${styles.toastContent} ${styles.toastContentError}`
    : styles.toastContent;

  return (
    <div className={styles.toastContainer}>
      <div className={contentClass}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
