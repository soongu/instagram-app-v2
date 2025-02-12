// src/components/feed/Stories/Stories.jsx
import {useRef, useState} from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import styles from './Stories.module.scss';
import profileImage from '../../assets/images/default-profile.svg';
import StoryItem from "./StoryItem.jsx";
// src/components/feed/Stories/Stories.jsx
const Stories = () => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const storiesRef = useRef(null);

  // 8개씩 표시할 것을 고려한 상수
  const ITEMS_PER_VIEW = 8;
  const ITEM_WIDTH = 66; // 각 스토리 아이템의 너비
  const GAP = 7; // 아이템 간 간격

  // 임시 데이터 (추후 API 연동)
  const stories = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
    profileImage: profileImage
  }));

  const handleScroll = (direction) => {
    const container = storiesRef.current;
    if (!container) return;

    // 한 번에 8개씩 스크롤
    const scrollAmount = (ITEM_WIDTH + GAP) * ITEMS_PER_VIEW;
    const newScrollLeft = direction === 'next'
      ? container.scrollLeft + scrollAmount
      : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    setScrollLeft(newScrollLeft);
  };

  const updateScrollButtons = (e) => {
    setScrollLeft(e.target.scrollLeft);
  };

  // 버튼 표시 여부 계산
  const containerWidth = ITEMS_PER_VIEW * (ITEM_WIDTH + GAP) - GAP;
  const totalWidth = stories.length * (ITEM_WIDTH + GAP) - GAP;

  const showPrevButton = scrollLeft > 0;
  const showNextButton = scrollLeft + containerWidth < totalWidth;

  return (
    <div className={styles.storiesContainer}>
      <div
        ref={storiesRef}
        className={styles.storiesList}
        onScroll={updateScrollButtons}
      >
        {stories.map((story) => (
          <StoryItem
            key={story.id}
            username={story.username}
            profileImage={story.profileImage}
          />
        ))}
      </div>

      {showPrevButton && (
        <button
          className={`${styles.navigationButton} ${styles.prev}`}
          onClick={() => handleScroll('prev')}
        >
          <FaChevronLeft />
        </button>
      )}

      {showNextButton && (
        <button
          className={`${styles.navigationButton} ${styles.next}`}
          onClick={() => handleScroll('next')}
        >
          <FaChevronRight />
        </button>
      )}
    </div>
  );
};

export default Stories;