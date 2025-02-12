import { useDispatch } from 'react-redux';
import { clearToken } from '../../features/auth/authSlice';
import { authApi } from '../../services/api.js';
import {
  FaGear,
  FaChartLine,
  FaRegBookmark,
  FaRegSun,
  FaRegFlag
} from 'react-icons/fa6';
import styles from './Sidebar.module.scss';
import {useNavigate} from "react-router-dom";

const MorePopover = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      dispatch(clearToken());
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      dispatch(clearToken());
    }
  };

  return (
    <div className={styles.moreMenu}>
      <button className={styles.menuItem}>
        <FaGear />
        <span>설정</span>
      </button>
      <button className={styles.menuItem}>
        <FaChartLine />
        <span>내 활동</span>
      </button>
      <button className={styles.menuItem}>
        <FaRegBookmark />
        <span>저장됨</span>
      </button>
      <button className={styles.menuItem}>
        <FaRegSun />
        <span>모드 전환</span>
      </button>
      <button className={styles.menuItem}>
        <FaRegFlag />
        <span>문제 신고</span>
      </button>
      <div className={styles.menuDivider} />
      <button className={styles.menuItem}>
        <span>계정 전환</span>
      </button>
      <div className={styles.menuDivider} />
      <button
        className={styles.menuItem}
        onClick={handleLogout}
      >
        <span>로그아웃</span>
      </button>
    </div>
  );
};


export default MorePopover;