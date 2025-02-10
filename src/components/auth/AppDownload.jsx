import styles from './AppDownload.module.scss';

const AppDownload = () => (
  <div className={styles.appDownload}>
    <p>앱을 다운로드하세요.</p>
    <div className={styles.buttons}>
      <a
        href="https://apps.apple.com/app/instagram/id389801252"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://static.cdninstagram.com/rsrc.php/v4/yi/r/cWx_hQBPmbo.png"
          alt="App Store에서 다운로드"
        />
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.instagram.android"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://static.cdninstagram.com/rsrc.php/v4/ye/r/UtJtFmFLCiD.png"
          alt="Google Play에서 다운로드"
        />
      </a>
    </div>
  </div>
);

export default AppDownload;