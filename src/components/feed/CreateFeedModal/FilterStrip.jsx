import { useMemo } from 'react';
import { FILTERS } from './filters';
import styles from './FilterStrip.module.scss';

/**
 * @param {File} previewFile    - 현재 슬라이드의 이미지 파일 (캐러셀 이동 시 변경됨)
 * @param {string} selectedFilter - 현재 슬라이드에 적용된 필터 CSS
 * @param {Function} onFilterSelect - 필터 선택 콜백
 */
const FilterStrip = ({ previewFile, selectedFilter, onFilterSelect }) => {
  const previewUrl = useMemo(
    () => (previewFile ? URL.createObjectURL(previewFile) : null),
    [previewFile]
  );

  if (!previewUrl) return null;

  return (
    <div className={styles.filterStrip}>
      {FILTERS.map((filter) => {
        const isActive = selectedFilter === filter.css;
        return (
          <button
            key={filter.name}
            className={`${styles.filterItem} ${isActive ? styles.active : ''}`}
            onClick={() => onFilterSelect(filter.css)}
            type="button"
          >
            <div className={styles.thumbnailWrapper}>
              <img
                src={previewUrl}
                alt={filter.name}
                style={{ filter: filter.css || 'none' }}
              />
            </div>
            <span className={styles.filterName}>{filter.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterStrip;
