// src/components/common/Toast.jsx
import { useEffect } from 'react';
import styles from './Toast.module.scss';

const Toast = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.toastContainer}>
      <div className={styles.toastContent}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
