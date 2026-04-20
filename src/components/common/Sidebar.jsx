// src/components/common/Sidebar.jsx

import {Link, NavLink} from 'react-router-dom';
import defaultProfileImage from '../../assets/images/default-profile.svg';
import {
  FaAt,
  FaBars,
  FaFilm,
  FaHouse,
  FaMagnifyingGlass,
  FaRegCompass,
  FaRegHeart,
  FaRegPaperPlane,
  FaRegSquarePlus
} from 'react-icons/fa6';
import InstagramLogo from './InstagramLogo';
import styles from './Sidebar.module.scss';
import MorePopover from "./MorePopover.jsx";
import {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import { openCreateFeedModal } from '../../store/createFeedModalSlice';
import { toggleSearchPanel, closeSearchPanel } from '../../store/searchPanelSlice';
import { toggleNotificationPanel, closeNotificationPanel } from '../../store/notificationPanelSlice';
import { clearUnreadCount } from '../../store/notificationsSlice';
import CreateFeedModal from '../feed/CreateFeedModal/index';
import SearchPanel from './SearchPanel/SearchPanel';
import NotificationPanel from './NotificationPanel/NotificationPanel';

const Sidebar = () => {

  const storedUser = useSelector(state => state.auth.user);
  const isSearchOpen = useSelector(state => state.searchPanel.isOpen);
  const isNotificationOpen = useSelector(state => state.notificationPanel.isOpen);
  const unreadNotifications = useSelector(state => state.notifications.unreadCount);
  const dmUnreadByConversationId = useSelector(state => state.dm.unreadByConversationId);
  const dmUnreadTotal = Object.values(dmUnreadByConversationId).reduce((a, b) => a + b, 0);
  const dispatch = useDispatch();

  const isPanelOpen = isSearchOpen || isNotificationOpen;

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const toggleMoreMenu = () => {
    setShowMoreMenu(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.moreMenu}`) &&
        !event.target.closest(`#moreButton`)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchToggle = () => {
    if (isNotificationOpen) dispatch(closeNotificationPanel());
    dispatch(toggleSearchPanel());
  };

  const handleNotificationToggle = () => {
    if (isSearchOpen) dispatch(closeSearchPanel());
    // 패널 여는 동작 = 사용자가 뱃지 확인 → 클리어 (실제 read 처리는 항목 클릭 시 각각)
    if (!isNotificationOpen) dispatch(clearUnreadCount());
    dispatch(toggleNotificationPanel());
  };

  const handleNavClick = () => {
    if (isSearchOpen) dispatch(closeSearchPanel());
    if (isNotificationOpen) dispatch(closeNotificationPanel());
  };

  const handleBackdropClick = () => {
    if (isSearchOpen) dispatch(closeSearchPanel());
    if (isNotificationOpen) dispatch(closeNotificationPanel());
  };

  return (
    <>
      <nav className={`${styles.sidebar} ${isPanelOpen ? styles.collapsed : ''}`}>
        <div className={styles.logoContainer}>
          <Link to="/" className={styles.logo} onClick={handleNavClick}>
            <InstagramLogo/>
          </Link>
        </div>

        <div className={styles.menuContainer}>
          <NavLink to="/" className={styles.menuItem} onClick={handleNavClick}>
            <FaHouse size={24}/>
            <span className={styles.menuText}>홈</span>
          </NavLink>

          <button type="button" className={styles.menuItem} onClick={handleSearchToggle}>
            <FaMagnifyingGlass size={24}/>
            <span className={styles.menuText}>검색</span>
          </button>

          <NavLink to="/explore" className={styles.menuItem} onClick={handleNavClick}>
            <FaRegCompass size={24}/>
            <span className={styles.menuText}>탐색 탭</span>
          </NavLink>

          <NavLink to="/reels" className={styles.menuItem} onClick={handleNavClick}>
            <FaFilm size={24}/>
            <span className={styles.menuText}>릴스</span>
          </NavLink>

          <NavLink to="/direct/inbox" className={styles.menuItem} onClick={handleNavClick}>
            <span className={styles.iconWrap}>
              <FaRegPaperPlane size={24}/>
              {dmUnreadTotal > 0 && <span className={styles.badgeDot} aria-label="안읽음" />}
            </span>
            <span className={styles.menuText}>메시지</span>
          </NavLink>

          <button type="button" className={styles.menuItem} onClick={handleNotificationToggle}>
            <span className={styles.iconWrap}>
              <FaRegHeart size={24}/>
              {unreadNotifications > 0 && <span className={styles.badgeDot} aria-label="안읽음" />}
            </span>
            <span className={styles.menuText}>알림</span>
          </button>

          <button type="button" className={styles.menuItem} onClick={() => dispatch(openCreateFeedModal())}>
            <FaRegSquarePlus size={24}/>
            <span className={styles.menuText}>만들기</span>
          </button>

          <NavLink to={storedUser?.username ? `/${storedUser.username}` : '/'} className={styles.menuItem} onClick={handleNavClick}>
            <div className={styles.profileImage}>
              <img src={storedUser?.profileImage || defaultProfileImage} alt="프로필"/>
            </div>
            <span className={styles.menuText}>프로필</span>
          </NavLink>
        </div>

        <div className={styles.bottomMenu}>
          <NavLink to="/threads" className={styles.menuItem} onClick={handleNavClick}>
            <FaAt size={24}/>
            <span className={styles.menuText}>Threads</span>
          </NavLink>

          <div style={{position: 'relative'}}>
            <button type="button" id='moreButton' className={styles.menuItem} onClick={toggleMoreMenu}>
              <FaBars size={24}/>
              <span className={styles.menuText}>더 보기</span>
            </button>

            {showMoreMenu && <MorePopover/>}
          </div>
        </div>

        <CreateFeedModal />
      </nav>

      {isPanelOpen && <div className={styles.searchBackdrop} onClick={handleBackdropClick} />}
      <SearchPanel />
      <NotificationPanel />
    </>
  );
};

export default Sidebar;
