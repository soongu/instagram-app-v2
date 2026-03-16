// src/components/common/GlobalToast.jsx
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../../store/toastSlice.js';
import Toast from './Toast';

const GlobalToast = () => {
  const dispatch = useDispatch();
  const { message, type, isVisible } = useSelector((state) => state.toast);

  return (
    <Toast
      message={message}
      isVisible={isVisible}
      onClose={() => dispatch(hideToast())}
      duration={3000}
      variant={type}
    />
  );
};

export default GlobalToast;
