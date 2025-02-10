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

function Sidebar() {
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

        <NavLink to="/profile" className={styles.menuItem}>
          <div className={styles.profileImage}>
            <img src={defaultProfileImage} alt="프로필"/>
          </div>
          <span className={styles.menuText}>프로필</span>
        </NavLink>
      </div>

      <div className={styles.bottomMenu}>
        <NavLink to="/threads" className={styles.menuItem}>
          <FaAt size={24}/>
          <span className={styles.menuText}>Threads</span>
        </NavLink>

        <button type="button" className={styles.menuItem}>
          <FaBars size={24}/>
          <span className={styles.menuText}>더 보기</span>
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;