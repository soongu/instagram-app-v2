// src/components/common/Carousel/Carousel.jsx
import { useCallback, useState } from 'react';
import {FaChevronLeft, FaChevronRight, FaHeart} from 'react-icons/fa6';
import styles from './Carousel.module.scss';

/**
 * @param {Array} items         - 이미지 URL 객체 배열 (type='image') 또는 File 배열 (type='file')
 * @param {string} type         - 'image' | 'file'
 * @param {Function} onImageDoubleClick - 더블클릭 콜백
 * @param {string|string[]} filterStyle - 단일 필터 CSS 문자열 또는 슬라이드별 필터 배열
 * @param {Function} onSlideChange - 슬라이드 변경 시 인덱스를 올려주는 콜백
 */
const Carousel = ({ items, type = 'image', onImageDoubleClick, filterStyle, onSlideChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);

  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= items.length) return;
    setCurrentIndex(index);
    onSlideChange?.(index);
  }, [items.length, onSlideChange]);

  const handleDoubleClick = useCallback((e) => {
    if (!onImageDoubleClick) return;   // 피드 생성 모달 등 콜백 없을 때 무시
    onImageDoubleClick(e);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  }, [onImageDoubleClick]);

  // filterStyle이 배열이면 슬라이드별, 문자열이면 전체 공통 적용
  const getFilterForIndex = (index) => {
    if (!filterStyle) return undefined;
    return Array.isArray(filterStyle) ? (filterStyle[index] || '') : filterStyle;
  };

  if (!items?.length) return null;

  return (
    <div className={styles.carouselContainer}>
      <div
        className={styles.carouselTrack}
        style={{transform: `translateX(-${currentIndex * 100}%)`}}
      >
        {items.map((item, index) => {
          const filter = getFilterForIndex(index);
          return (
            <div
              key={index}
              className={styles.carouselSlide}
              onDoubleClick={handleDoubleClick}
            >
              {type === 'image' ? (
                <img src={item.imageUrl} alt={`slide ${index + 1}`} />
              ) : (
                <img
                  src={URL.createObjectURL(item)}
                  alt={`preview ${index + 1}`}
                  style={filter ? { filter, width: '100%', height: '100%', objectFit: 'cover' } : undefined}
                />
              )}
              {showHeart && <FaHeart className={styles.doubleClickHeart} />}
            </div>
          );
        })}
      </div>

      {items.length > 1 && (
        <>
          <button
            className={`${styles.carouselButton} ${styles.prev}`}
            onClick={() => goToSlide(currentIndex - 1)}
            style={{display: currentIndex === 0 ? 'none' : 'flex'}}
          >
            <FaChevronLeft />
          </button>

          <button
            className={`${styles.carouselButton} ${styles.next}`}
            onClick={() => goToSlide(currentIndex + 1)}
            style={{display: currentIndex === items.length - 1 ? 'none' : 'flex'}}
          >
            <FaChevronRight />
          </button>

          <div className={styles.indicators}>
            {items.map((_, index) => (
              <span
                key={index}
                className={`${styles.indicator} ${currentIndex === index ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;