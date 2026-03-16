import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaImages } from 'react-icons/fa6';
import styles from '../CreateFeedModal.module.scss';
import { showToast } from '../../../store/toastSlice.js';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// SVG는 보안 및 렌더링 이슈로 업로드 불가
const BLOCKED_TYPES = ['image/svg+xml'];

const validateFiles = (files) => {
  const valid = [];
  const errors = [];
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name}은(는) 이미지가 아닙니다.`);
      return;
    }
    if (BLOCKED_TYPES.includes(file.type)) {
      errors.push(`${file.name}은(는) 업로드할 수 없는 형식입니다. (SVG 미지원)`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}은(는) 10MB를 초과합니다.`);
      return;
    }
    valid.push(file);
  });
  return { valid, errors };
};

const Step1Upload = ({ onFilesSelected }) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = (rawFiles) => {
    if (rawFiles.length > MAX_FILES) {
      dispatch(showToast({ message: `최대 ${MAX_FILES}개의 파일만 선택 가능합니다.`, type: 'error' }));
      return;
    }
    const { valid, errors } = validateFiles(rawFiles);
    errors.forEach((msg) => dispatch(showToast({ message: msg, type: 'error' })));
    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  };

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
    if (e.dataTransfer.files?.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
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
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
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
  );
};

export default Step1Upload;
