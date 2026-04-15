import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { FaTimes } from 'react-icons/fa';
import { memberApi } from '../../../services/api';
import { closeSearchPanel } from '../../../store/searchPanelSlice';
import defaultProfileImage from '../../../assets/images/default-profile.svg';
import styles from './SearchPanel.module.scss';

const STORAGE_KEY = 'recentSearches';
const MAX_RECENT = 20;

const loadRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const saveRecentSearches = (searches) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
};

const SearchPanel = () => {
  const isOpen = useSelector((state) => state.searchPanel.isOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const sentinelRef = useRef(null);
  const cursorRef = useRef(null);
  const isFetchingRef = useRef(false);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // 패널 열릴 때 최근 검색 로드 + input 포커스
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(loadRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery('');
      setSearchResults([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasNext(false);
      cursorRef.current = null;
    }
  }, [isOpen]);

  // 라우트 변경 시 패널 닫기
  useEffect(() => {
    if (isOpen) {
      dispatch(closeSearchPanel());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') dispatch(closeSearchPanel());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  // 디바운스 검색 (첫 페이지)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (keyword) => {
      if (!keyword.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        setHasNext(false);
        cursorRef.current = null;
        return;
      }
      try {
        const response = await memberApi.search(keyword);
        const items = response?.items ?? [];
        setSearchResults(items);
        setHasNext(response?.hasNext ?? false);
        if (items.length > 0) {
          cursorRef.current = items[items.length - 1].memberId;
        } else {
          cursorRef.current = null;
        }
      } catch (error) {
        console.error('검색 실패:', error);
        setSearchResults([]);
        setHasNext(false);
        cursorRef.current = null;
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // cleanup
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // 추가 페이지 로드
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasNext || !query.trim()) return;
    isFetchingRef.current = true;
    setIsLoadingMore(true);
    try {
      const [response] = await Promise.all([
        memberApi.search(query, cursorRef.current),
        new Promise((r) => setTimeout(r, 300)),
      ]);
      const items = response?.items ?? [];
      setSearchResults((prev) => [...prev, ...items]);
      setHasNext(response?.hasNext ?? false);
      if (items.length > 0) {
        cursorRef.current = items[items.length - 1].memberId;
      }
    } catch (error) {
      console.error('추가 검색 실패:', error);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasNext, query]);

  // 무한스크롤 Observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNext || isLoading || isLoadingMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingRef.current) {
          loadMore();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, isLoading, isLoadingMore, loadMore]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    cursorRef.current = null;
    if (value.trim()) {
      setIsLoading(true);
      setHasNext(false);
      setSearchResults([]);
      debouncedSearch(value);
    } else {
      debouncedSearch.cancel();
      setSearchResults([]);
      setIsLoading(false);
      setHasNext(false);
    }
  };

  const handleClearInput = () => {
    setQuery('');
    debouncedSearch.cancel();
    setSearchResults([]);
    setIsLoading(false);
    setHasNext(false);
    cursorRef.current = null;
    inputRef.current?.focus();
  };

  const handleUserClick = (user) => {
    const updated = [user, ...recentSearches.filter((s) => s.memberId !== user.memberId)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    saveRecentSearches(updated);

    dispatch(closeSearchPanel());
    navigate(`/${user.username}`);
  };

  const handleRemoveRecent = (e, memberId) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s.memberId !== memberId);
    setRecentSearches(updated);
    saveRecentSearches(updated);
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const showRecent = !query.trim();

  return (
    <div className={`${styles.searchPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h2>검색</h2>
      </div>

      <div className={styles.searchInputContainer}>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="검색"
          value={query}
          onChange={handleInputChange}
        />
        {query && (
          <button type="button" className={styles.clearButton} onClick={handleClearInput}>
            <FaTimes size={8} />
          </button>
        )}
      </div>

      <hr className={styles.divider} />

      <div className={styles.content}>
        {showRecent ? (
          <>
            {recentSearches.length > 0 && (
              <div className={styles.recentHeader}>
                <h3>최근 검색 항목</h3>
                <button type="button" className={styles.clearAllButton} onClick={handleClearAllRecent}>
                  모두 지우기
                </button>
              </div>
            )}
            {recentSearches.length > 0 ? (
              recentSearches.map((user) => (
                <div
                  key={user.memberId}
                  className={styles.resultItem}
                  onClick={() => handleUserClick(user)}
                >
                  <div className={styles.resultAvatar}>
                    <img src={user.profileImageUrl || defaultProfileImage} alt={user.username} />
                  </div>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultUsername}>{user.username}</span>
                    {user.name && <span className={styles.resultName}>{user.name}</span>}
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={(e) => handleRemoveRecent(e, user.memberId)}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>최근 검색 내역 없음</div>
            )}
          </>
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonAvatar} />
              <div>
                <div className={styles.skeletonUsername} />
                <div className={styles.skeletonName} />
              </div>
            </div>
          ))
        ) : searchResults.length > 0 ? (
          <>
            {searchResults.map((user) => (
              <div
                key={user.memberId}
                className={styles.resultItem}
                onClick={() => handleUserClick(user)}
              >
                <div className={styles.resultAvatar}>
                  <img src={user.profileImageUrl || defaultProfileImage} alt={user.username} />
                </div>
                <div className={styles.resultInfo}>
                  <span className={styles.resultUsername}>{user.username}</span>
                  {user.name && <span className={styles.resultName}>{user.name}</span>}
                </div>
              </div>
            ))}
            {hasNext && <div ref={sentinelRef} className={styles.sentinel} />}
            {isLoadingMore && (
              <div className={styles.loadingMore}>
                <div className={styles.spinner} />
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>검색 결과 없음</div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
