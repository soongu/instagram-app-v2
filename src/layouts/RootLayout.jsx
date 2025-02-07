import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import styles from './RootLayout.module.scss';

const RootLayout = () => (
  <div className={styles.container}>
    <Sidebar/>
    <main className={styles.main}>
      <Outlet/>
    </main>
  </div>
);

export default RootLayout;