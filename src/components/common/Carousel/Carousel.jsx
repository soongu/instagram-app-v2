// src/components/common/Carousel/Carousel.jsx
import { useCallback, useState } from 'react';
import {FaChevronLeft, FaChevronRight, FaHeart} from 'react-icons/fa6';
import styles from './Carousel.module.scss';

const Carousel = ({ items, type = 'image', onImageDoubleClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 더블클릭 애니메이션
  const [showHeart, setShowHeart] = useState(false);

  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= items.length) return;
    setCurrentIndex(index);
  }, [items.length]);

  // 이미지 더블클릭 핸들러
  const handleDoubleClick = useCallback((e) => {
    if (onImageDoubleClick) {
      onImageDoubleClick(e); // 좋아요 토글실행
    }

    setShowHeart(true); // ✅ 하트 애니메이션 활성화
    setTimeout(() => setShowHeart(false), 800); // 0.8초 후 하트 숨김

  }, [onImageDoubleClick]);

  if (!items?.length) return null;

  return (
    <div className={styles.carouselContainer}>
      <div
        className={styles.carouselTrack}
        style={{transform: `translateX(-${currentIndex * 100}%)`}}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={styles.carouselSlide}
            onDoubleClick={handleDoubleClick}
          >
            {type === 'image' ? (
              // 피드 목록용 (이미지 URL)
              <img
                src={item.imageUrl}
                alt={`slide ${index + 1}`}
              />
            ) : (
              // 피드 생성용 (File 객체)
              <img
                src={URL.createObjectURL(item)}
                alt={`preview ${index + 1}`}
              />
            )}
            {showHeart && <FaHeart className={styles.doubleClickHeart} />}
          </div>
        ))}
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
            style={{
              display: currentIndex === items.length - 1 ? 'none' : 'flex'
            }}
          >
            <FaChevronRight />
          </button>

          <div className={styles.indicators}>
            {items.map((_, index) => (
              <span
                key={index}
                className={`${styles.indicator} ${
                  currentIndex === index ? styles.active : ''
                }`}
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