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
import {useSelector} from "react-redux";

const Sidebar = () => {

  const storedUser = useSelector(state => state.auth.user);


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


  return (
    <nav className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          <InstagramLogo/>
        </Link>
      </div>

      <div className={styles.menuContainer}>
        <NavLink to="/" className={styles.menuItem}>
          <FaHouse size={24}/>
          <span className={styles.menuText}>홈</span>
        </NavLink>

        <button type="button" className={styles.menuItem}>
          <FaMagnifyingGlass size={24}/>
          <span className={styles.menuText}>검색</span>
        </button>

        <NavLink to="/explore" className={styles.menuItem}>
          <FaRegCompass size={24}/>
          <span className={styles.menuText}>탐색 탭</span>
        </NavLink>

        <NavLink to="/reels" className={styles.menuItem}>
          <FaFilm size={24}/>
          <span className={styles.menuText}>릴스</span>
        </NavLink>

        <NavLink to="/direct/inbox" className={styles.menuItem}>
          <FaRegPaperPlane size={24}/>
          <span className={styles.menuText}>메시지</span>
        </NavLink>

        <button type="button" className={styles.menuItem}>
          <FaRegHeart size={24}/>
          <span className={styles.menuText}>알림</span>
        </button>

        <button type="button" className={styles.menuItem}>
          <FaRegSquarePlus size={24}/>
          <span className={styles.menuText}>만들기</span>
        </button>

        <NavLink to={`/${storedUser?.username}`} className={styles.menuItem}>
          <div className={styles.profileImage}>
            <img src={storedUser?.profileImage || defaultProfileImage} alt="프로필"/>
          </div>
          <span className={styles.menuText}>프로필</span>
        </NavLink>
      </div>

      <div className={styles.bottomMenu}>
        <NavLink to="/threads" className={styles.menuItem}>
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

    </nav>
  );
};

export default Sidebar;