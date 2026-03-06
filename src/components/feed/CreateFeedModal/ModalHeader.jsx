import { FaArrowLeft, FaSpinner } from 'react-icons/fa6';
import styles from '../CreateFeedModal.module.scss';

const ModalHeader = ({ step, isLoading, onBack, onNext }) => {
  const title = step === 2 ? '편집' : '새 게시물 만들기';
  const nextBtnText = step === 2 ? '다음' : '공유하기';

  return (
    <div className={styles.modalHeader}>
      <button
        className={styles.backButton}
        onClick={onBack}
        style={{ visibility: step > 1 && !isLoading ? 'visible' : 'hidden' }}
        type="button"
      >
        <FaArrowLeft />
      </button>

      <h2 className={styles.modalTitle}>{title}</h2>

      {step > 1 && (
        <button
          className={`${styles.nextButton} ${isLoading ? styles.loading : ''}`}
          onClick={onNext}
          disabled={isLoading}
          type="button"
        >
          {nextBtnText}
        </button>
      )}

      {isLoading && (
        <div className={styles.loadingSpinner}>
          <FaSpinner className="fa-spin" />
        </div>
      )}
    </div>
  );
};

export default ModalHeader;
