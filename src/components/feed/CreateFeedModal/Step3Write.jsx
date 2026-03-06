import { useRef, useState } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { hashtagApi } from '../../../services/api';
import Carousel from '../../common/Carousel/Carousel';
import styles from '../CreateFeedModal.module.scss';
import defaultProfileImage from '../../../assets/images/default-profile.svg';

const MAX_CONTENT_LENGTH = 2200;

const Step3Write = ({ files, user, content, onContentChange, filterStyle }) => {
  const textareaRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hashtagRange, setHashtagRange] = useState({ start: 0, end: 0 });
  const searchTimeoutRef = useRef(null);

  const handleInput = (e) => {
    let val = e.target.value;
    if (val.length > MAX_CONTENT_LENGTH) {
      val = val.slice(0, MAX_CONTENT_LENGTH);
    }
    onContentChange(val);

    const cursorPosition = e.target.selectionStart;
    const beforeCursorText = val.substring(0, cursorPosition);
    const match = beforeCursorText.match(/#[\w가-힣]*$/);

    if (match) {
      const keyword = match[0].substring(1);
      setHashtagRange({ start: match.index, end: cursorPosition });

      clearTimeout(searchTimeoutRef.current);

      if (keyword) {
        searchTimeoutRef.current = setTimeout(async () => {
          try {
            const res = await hashtagApi.searchHashtags(keyword);
            setSuggestions(res || []);
            setShowSuggestions(true);
          } catch {
            setShowSuggestions(false);
          }
        }, 300);
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
    onContentChange(newText);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className={styles.writeContainer}>
      <div className={styles.writeLayout}>
        {/* 왼쪽: 캐러셀 */}
        <div className={styles.previewArea}>
          <Carousel items={files} type="file" filterStyle={filterStyle} />
        </div>

        {/* 오른쪽: 글쓰기 */}
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
              rows={10}
              value={content}
              onChange={handleInput}
              placeholder="문구 입력..."
            />
            <div className={`${styles.charCounter} ${content.length >= MAX_CONTENT_LENGTH ? styles.exceed : ''}`}>
              {content.length.toLocaleString()}/2,200
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.hashtagSuggestions}>
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
  );
};

export default Step3Write;
