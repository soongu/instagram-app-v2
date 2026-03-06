import styles from '../CreateFeedModal.module.scss';

const DiscardModal = ({ onConfirm, onCancel }) => (
  <div className={styles.nestedModal}>
    <div className={styles.nestedModalContent}>
      <div className={styles.nestedModalTitle}>
        <h3>게시물을 삭제하시겠어요?</h3>
        <p>지금 나가면 수정 내용이 저장되지 않습니다.</p>
      </div>
      <div className={styles.nestedModalButtons}>
        <button className={styles.deleteButton} onClick={onConfirm} type="button">
          삭제
        </button>
        <button className={styles.cancelButton} onClick={onCancel} type="button">
          취소
        </button>
      </div>
    </div>
  </div>
);

export default DiscardModal;
