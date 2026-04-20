import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPenToSquare } from 'react-icons/fa6';
import ConversationItem from './ConversationItem';
import styles from './ConversationList.module.scss';

const TABS = [
  { key: 'primary', label: 'Primary' },
  { key: 'general', label: 'General' },
  { key: 'requests', label: '요청' },
];

const ConversationList = ({
  conversations,
  isLoading,
  isLoadingMore,
  hasNext,
  onLoadMore,
  selectedConversationId,
  onSelect,
}) => {
  const storedUser = useSelector((state) => state.auth.user);
  const unreadByConversationId = useSelector((state) => state.dm.unreadByConversationId);

  const [activeTab, setActiveTab] = useState('primary');
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNext || isLoading || isLoadingMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore?.();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, isLoading, isLoadingMore, onLoadMore]);

  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.usernameButton}>
          <span className={styles.username}>{storedUser?.username ?? ''}</span>
          <span className={styles.caret}>▾</span>
        </button>
        <button type="button" className={styles.composeButton} aria-label="새 메시지">
          <FaPenToSquare size={20} />
        </button>
      </header>

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.search}>
        <input type="text" placeholder="검색" className={styles.searchInput} disabled />
      </div>

      <div className={styles.listScroll}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonText}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))
        ) : activeTab !== 'primary' ? (
          <div className={styles.emptyState}>준비 중입니다</div>
        ) : conversations.length === 0 ? (
          <div className={styles.emptyState}>대화방이 없습니다</div>
        ) : (
          <>
            {conversations.map((c) => (
              <ConversationItem
                key={c.conversationId}
                conversation={c}
                isActive={c.conversationId === selectedConversationId}
                unreadCount={unreadByConversationId[c.conversationId] ?? 0}
                onClick={() => onSelect?.(c.conversationId)}
              />
            ))}
            {hasNext && <div ref={sentinelRef} className={styles.sentinel} />}
            {isLoadingMore && (
              <div className={styles.loadingMore}>
                <div className={styles.spinner} />
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
