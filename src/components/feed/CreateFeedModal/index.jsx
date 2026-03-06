import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaXmark } from 'react-icons/fa6';
import { closeCreateFeedModal } from '../../../store/createFeedModalSlice';
import { postApi } from '../../../services/api';
import { applyFiltersToFiles } from '../../../utils/filterUtils';
import ModalHeader from './ModalHeader';
import Step1Upload from './Step1Upload';
import Step2Preview from './Step2Preview';
import Step3Write from './Step3Write';
import DiscardModal from './DiscardModal';
import styles from '../CreateFeedModal.module.scss';

const CreateFeedModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.createFeedModal?.isOpen);
  const user = useSelector((state) => state.auth?.user);

  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');
  // 이미지 인덱스별 필터 CSS 배열 (e.g. ['', 'grayscale(1)', ...])
  const [filterMap, setFilterMap] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const resetModal = useCallback(() => {
    setStep(1);
    setFiles([]);
    setContent('');
    setFilterMap([]);
    setIsLoading(false);
    setShowDiscardModal(false);
  }, []);

  useEffect(() => {
    if (!isOpen) resetModal();
  }, [isOpen, resetModal]);

  // 닫기 처리: step 2 이후라면 삭제 확인 모달 표시
  const handleClose = () => {
    if (step >= 2) {
      setShowDiscardModal(true);
    } else {
      dispatch(closeCreateFeedModal());
    }
  };

  // 삭제 확인
  const handleConfirmDiscard = () => {
    dispatch(closeCreateFeedModal());
    setShowDiscardModal(false);
  };

  // Step 1 → 2: 파일 선택 완료 (filterMap 초기화)
  const handleFilesSelected = (validFiles) => {
    setFiles(validFiles);
    setFilterMap(new Array(validFiles.length).fill(''));
    setStep(2);
  };

  // 특정 인덱스 이미지의 필터 변경
  const handleFilterSelect = (index, css) => {
    setFilterMap((prev) => {
      const next = [...prev];
      next[index] = css;
      return next;
    });
  };

  // 다음 / 공유하기 버튼
  const handleNext = async () => {
    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      if (isLoading) return;
      setIsLoading(true);
      try {
        // 필터가 적용된 이미지 Blob 생성 (없으면 원본 File 그대로)
        const processedBlobs = await applyFiltersToFiles(files, filterMap);

        const formData = new FormData();
        formData.append(
          'feed',
          new Blob([JSON.stringify({ content: content.trim() })], { type: 'application/json' })
        );
        processedBlobs.forEach((blob, i) =>
          formData.append('images', blob, files[i].name)
        );

        await postApi.createPost(formData);
        dispatch(closeCreateFeedModal());
        window.location.reload();
      } catch (error) {
        console.error('Failed to create post:', error);
        alert(error.response?.data?.message || '게시물 생성에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalBackdrop} onClick={handleClose} />

      <button className={styles.modalCloseButton} onClick={handleClose} type="button">
        <FaXmark />
      </button>

      <div className={styles.modalContent}>
        <ModalHeader
          step={step}
          isLoading={isLoading}
          onBack={handleBack}
          onNext={handleNext}
        />

        <div className={styles.modalBody}>
          {/* Step 1 */}
          <div className={`${styles.step} ${step === 1 ? styles.active : ''}`}>
            <Step1Upload onFilesSelected={handleFilesSelected} />
          </div>

          {/* Step 2 */}
          <div className={`${styles.step} ${step === 2 ? styles.active : ''}`}>
            {step === 2 && (
              <Step2Preview
                files={files}
                filterMap={filterMap}
                onFilterSelect={handleFilterSelect}
              />
            )}
          </div>

          {/* Step 3 */}
          <div className={`${styles.step} ${step === 3 ? styles.active : ''}`}>
            {step === 3 && (
              <Step3Write
                files={files}
                user={user}
                content={content}
                onContentChange={setContent}
                filterStyle={filterMap}
              />
            )}
          </div>
        </div>
      </div>

      {showDiscardModal && (
        <DiscardModal
          onConfirm={handleConfirmDiscard}
          onCancel={() => setShowDiscardModal(false)}
        />
      )}
    </div>
  );
};

export default CreateFeedModal;
