import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPenToSquare } from 'react-icons/fa6';
import { conversationApi } from '../../../services/api';
import ConversationItem from './ConversationItem';
import styles from './ConversationList.module.scss';

const TABS = [
  { key: 'primary', label: 'Primary' },
  { key: 'general', label: 'General' },
  { key: 'requests', label: '요청' },
];

const ConversationList = ({ selectedConversationId, onSelect }) => {
  const storedUser = useSelector((state) => state.auth.user);
  const unreadByConversationId = useSelector((state) => state.dm.unreadByConversationId);

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('primary');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await conversationApi.list();
        if (!cancelled) setConversations(data ?? []);
      } catch (err) {
        console.error('[DM] 대화방 목록 조회 실패:', err);
        if (!cancelled) setConversations([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
          conversations.map((c) => (
            <ConversationItem
              key={c.conversationId}
              conversation={c}
              isActive={c.conversationId === selectedConversationId}
              unreadCount={unreadByConversationId[c.conversationId] ?? 0}
              onClick={() => onSelect?.(c.conversationId)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
