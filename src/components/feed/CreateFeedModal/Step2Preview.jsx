import { useState } from 'react';
import Carousel from '../../common/Carousel/Carousel';
import FilterStrip from './FilterStrip';
import styles from '../CreateFeedModal.module.scss';

/**
 * @param {File[]} files
 * @param {string[]} filterMap  - 이미지 인덱스별 필터 CSS 배열
 * @param {(index: number, css: string) => void} onFilterSelect
 */
const Step2Preview = ({ files, filterMap, onFilterSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewArea}>
        <Carousel
          items={files}
          type="file"
          filterStyle={filterMap}
          onSlideChange={setCurrentIndex}
        />
      </div>
      <FilterStrip
        previewFile={files[currentIndex]}
        selectedFilter={filterMap[currentIndex] ?? ''}
        onFilterSelect={(css) => onFilterSelect(currentIndex, css)}
      />
    </div>
  );
};

export default Step2Preview;
