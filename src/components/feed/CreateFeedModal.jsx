import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCreateFeedModal } from '../../store/createFeedModalSlice';
import { postApi, hashtagApi } from '../../services/api';
import { FaImages, FaXmark, FaArrowLeft, FaSpinner, FaChevronRight } from 'react-icons/fa6';
import Carousel from '../common/Carousel/Carousel';
import styles from './CreateFeedModal.module.scss';
import defaultProfileImage from '../../assets/images/default-profile.svg';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONTENT_LENGTH = 2200;

const CreateFeedModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.createFeedModal?.isOpen);
  const user = useSelector((state) => state.auth?.user);

  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNestedModal, setShowNestedModal] = useState(false);

  // Hashtag states
  const [hashtagKeyword, setHashtagKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hashtagRange, setHashtagRange] = useState({ start: 0, end: 0 });
  const searchTimeoutRef = useRef(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Reset modal state
  const resetModal = useCallback(() => {
    setStep(1);
    setFiles([]);
    setContent('');
    setIsDragging(false);
    setIsLoading(false);
    setShowNestedModal(false);
    setHashtagKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen, resetModal]);

  const handleClose = () => {
    if (step >= 2) {
      setShowNestedModal(true);
    } else {
      dispatch(closeCreateFeedModal());
    }
  };

  const handleConfirmClose = () => {
    dispatch(closeCreateFeedModal());
    setShowNestedModal(false);
  };

  const validateFiles = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}은(는) 이미지가 아닙니다.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name}은(는) 10MB를 초과합니다.`);
        return false;
      }
      return true;
    });
    return validFiles;
  };

  const processFiles = (selectedFiles) => {
    if (selectedFiles.length > MAX_FILES) {
      alert(`최대 ${MAX_FILES}개의 파일만 선택 가능합니다.`);
      return;
    }
    const validated = validateFiles(selectedFiles);
    if (validated.length > 0) {
      setFiles(validated);
      setStep(2);
    }
  };

  // Drag & Drop Handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNextStep = async () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Submit
      if (isLoading) return;
      setIsLoading(true);

      try {
        const formData = new FormData();
        const feedData = {
          content: content.trim()
        };
        formData.append('feed', new Blob([JSON.stringify(feedData)], { type: 'application/json' }));
        files.forEach((file) => formData.append('images', file));

        await postApi.createPost(formData);
        
        // Success
        dispatch(closeCreateFeedModal());
        window.location.reload(); // Refresh feed based on legacy logic
      } catch (error) {
        console.error('Failed to create post:', error);
        alert(error.response?.data?.message || '게시물 생성에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Textarea input and hashtag logic
  const handleContentChange = (e) => {
    let val = e.target.value;
    if (val.length > MAX_CONTENT_LENGTH) {
      val = val.slice(0, MAX_CONTENT_LENGTH);
    }
    setContent(val);

    const cursorPosition = e.target.selectionStart;
    const beforeCursorText = val.substring(0, cursorPosition);
    const match = beforeCursorText.match(/#[\w가-힣]*$/);

    if (match) {
      const keyword = match[0].substring(1);
      setHashtagRange({ start: match.index, end: cursorPosition });
      setHashtagKeyword(keyword);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (keyword) {
        searchTimeoutRef.current = setTimeout(async () => {
          try {
            const res = await hashtagApi.searchHashtags(keyword);
            setSuggestions(res || []);
            setShowSuggestions(true);
          } catch (err) {
            console.error('Hashtag search failed:', err);
            setShowSuggestions(false);
          }
        }, 300); // debounce 300ms
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertHashtag = (tagName) => {
    const beforeHashtag = content.substring(0, hashtagRange.start);
    const afterHashtag = content.substring(hashtagRange.end);
    const newText = `${beforeHashtag}#${tagName} ${afterHashtag}`;
    
    setContent(newText);
    setShowSuggestions(false);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  if (!isOpen) return null;

  const modalTitle = step === 1 || step === 3 ? '새 게시물 만들기' : '편집';
  const nextBtnText = step === 2 ? '다음' : step === 3 ? '공유하기' : '';

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalBackdrop} onClick={handleClose} />
      
      <button className={styles.modalCloseButton} onClick={handleClose} type="button">
        <FaXmark />
      </button>

      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <button 
            className={styles.backButton} 
            onClick={handleBackStep}
            style={{ visibility: step > 1 && !isLoading ? 'visible' : 'hidden' }}
            type="button"
          >
            <FaArrowLeft />
          </button>
          
          <h2 className={styles.modalTitle}>{modalTitle}</h2>
          
          {step > 1 && (
            <button 
              className={`${styles.nextButton} ${isLoading ? styles.loading : ''}`}
              onClick={handleNextStep}
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

        {/* Body */}
        <div className={styles.modalBody}>
          
          {/* Step 1: Upload */}
          <div className={`${styles.step} ${step === 1 ? styles.active : ''}`}>
            <div className={styles.uploadContainer}>
              <div 
                className={`${styles.uploadArea} ${isDragging ? styles.dragover : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <FaImages size={48} color="#262626" />
                <p>사진과 동영상을 여기에 끌어다 놓으세요</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                <button 
                  className={styles.uploadButton} 
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  컴퓨터에서 선택
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Preview */}
          <div className={`${styles.step} ${step === 2 ? styles.active : ''}`}>
            <div className={styles.previewContainer}>
              <div className={styles.previewArea}>
                {step === 2 && <Carousel items={files} type="file" />}
              </div>
            </div>
          </div>

          {/* Step 3: Write */}
          <div className={`${styles.step} ${step === 3 ? styles.active : ''}`}>
            <div className={styles.writeContainer}>
              <div className={styles.writeLayout}>
                <div className={styles.previewArea}>
                  {step === 3 && <Carousel items={files} type="file" />}
                </div>

                <div className={styles.writeArea}>
                  <div className={styles.userInfo}>
                    <div className={styles.profileImage}>
                      <img src={user?.profileImageUrl || defaultProfileImage} alt="프로필" />
                    </div>
                    <span className={styles.username}>{user?.username || '사용자명'}</span>
                  </div>
                  
                  <div className={styles.contentInput}>
                    <textarea 
                      ref={textareaRef}
                      maxLength={MAX_CONTENT_LENGTH}
                      rows={10}
                      value={content}
                      onChange={handleContentChange}
                      placeholder="문구 입력..."
                    />
                    <div className={`${styles.charCounter} ${content.length >= MAX_CONTENT_LENGTH ? styles.exceed : ''}`}>
                      {content.length.toLocaleString()}/2,200
                    </div>

                    {/* Hashtag Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className={styles.hashtagSuggestions} style={{ display: 'block' }}>
                        {suggestions.map((tag, idx) => (
                          <div 
                            key={idx} 
                            className={styles.hashtagItem}
                            onClick={() => insertHashtag(tag.hashtag)}
                          >
                            <div className={styles.hashtagInfo}>
                              <span className={styles.hashtagName}>#{tag.hashtag}</span>
                              <span className={styles.postCount}>게시물 {tag.feedCount}개</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.additionalOptions}>
                    <div className={styles.optionItem}>
                      <span>위치 추가</span>
                      <FaChevronRight color="#737373" />
                    </div>
                    <div className={styles.optionItem}>
                      <span>접근성</span>
                      <FaChevronRight color="#737373" />
                    </div>
                    <div className={styles.optionItem}>
                      <span>고급 설정</span>
                      <FaChevronRight color="#737373" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Nested Modal (Delete Warning) */}
      {showNestedModal && (
        <div className={styles.nestedModal}>
          <div className={styles.nestedModalContent}>
            <div className={styles.nestedModalTitle}>
              <h3>게시물을 삭제하시겠어요?</h3>
              <p>지금 나가면 수정 내용이 저장되지 않습니다.</p>
            </div>
            <div className={styles.nestedModalButtons}>
              <button className={styles.deleteButton} onClick={handleConfirmClose} type="button">
                삭제
              </button>
              <button className={styles.cancelButton} onClick={() => setShowNestedModal(false)} type="button">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFeedModal;
