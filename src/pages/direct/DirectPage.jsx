import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegPaperPlane } from 'react-icons/fa6';
import ConversationList from '../../features/dm/components/ConversationList';
import MessagePane from '../../features/dm/components/MessagePane';
import { conversationApi } from '../../services/api';
import {
  setSelectedConversation,
  clearSelectedConversation,
} from '../../store/dmSlice';
import { onDmReceived } from '../../features/dm/dmEvents';
import styles from './DirectPage.module.scss';

const DirectPage = () => {
  const { conversationId: conversationIdParam } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedConversationId = useSelector((state) => state.dm.selectedConversationId);

  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMoreConversations, setIsLoadingMoreConversations] = useState(false);
  const [hasNextConversations, setHasNextConversations] = useState(false);
  const conversationsCursorRef = useRef(null);
  const isFetchingConvRef = useRef(false);

  const parsedId = conversationIdParam ? Number(conversationIdParam) : null;

  // 실시간 DM 수신 시 대화방 목록 prepend + 마지막 메시지/시각 갱신 참조용
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  useEffect(() => {
    if (parsedId) dispatch(setSelectedConversation(parsedId));
    else dispatch(clearSelectedConversation());
  }, [parsedId, dispatch]);

  const applySliceResponse = useCallback((sliceRes, { append }) => {
    const items = sliceRes?.items ?? [];
    setHasNextConversations(sliceRes?.hasNext ?? false);
    if (items.length > 0) {
      conversationsCursorRef.current = items[items.length - 1].conversationId;
    }
    setConversations((prev) => (append ? [...prev, ...items] : items));
  }, []);

  // 첫 페이지 로드
  useEffect(() => {
    let cancelled = false;
    conversationsCursorRef.current = null;
    setIsLoadingConversations(true);

    const load = async () => {
      try {
        const sliceRes = await conversationApi.list(null);
        if (cancelled) return;
        applySliceResponse(sliceRes, { append: false });
      } catch (err) {
        console.error('[DM] 대화방 목록 조회 실패:', err);
        if (!cancelled) {
          setConversations([]);
          setHasNextConversations(false);
        }
      } finally {
        if (!cancelled) setIsLoadingConversations(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [applySliceResponse]);

  const loadMoreConversations = useCallback(async () => {
    if (isFetchingConvRef.current || !hasNextConversations) return;
    isFetchingConvRef.current = true;
    setIsLoadingMoreConversations(true);
    try {
      const sliceRes = await conversationApi.list(conversationsCursorRef.current);
      applySliceResponse(sliceRes, { append: true });
    } catch (err) {
      console.error('[DM] 대화방 추가 로딩 실패:', err);
    } finally {
      isFetchingConvRef.current = false;
      setIsLoadingMoreConversations(false);
    }
  }, [hasNextConversations, applySliceResponse]);

  // 실시간 DM 수신 시 리스트 prepend + 마지막 메시지 갱신.
  // 알 수 없는 conversationId 가 오면 첫 페이지를 다시 땡겨와 동기화.
  useEffect(() => {
    return onDmReceived((incoming) => {
      if (!incoming?.conversationId) return;
      const current = conversationsRef.current;
      const idx = current.findIndex((c) => c.conversationId === incoming.conversationId);

      if (idx === -1) {
        conversationApi.list(null)
          .then((sliceRes) => {
            const items = sliceRes?.items ?? [];
            setConversations(items);
            setHasNextConversations(sliceRes?.hasNext ?? false);
            if (items.length > 0) {
              conversationsCursorRef.current = items[items.length - 1].conversationId;
            } else {
              conversationsCursorRef.current = null;
            }
          })
          .catch((err) => console.warn('[DM] 대화방 목록 재조회 실패:', err));
        return;
      }

      const updated = {
        ...current[idx],
        lastMessage: incoming.content,
        lastMessageAt: incoming.createdAt,
      };
      const next = [updated, ...current.slice(0, idx), ...current.slice(idx + 1)];
      setConversations(next);
    });
  }, []);

  const handleSelect = (conversationId) => {
    navigate(`/direct/t/${conversationId}`);
  };

  const selectedConversation = selectedConversationId
    ? conversations.find((c) => c.conversationId === selectedConversationId) ?? null
    : null;

  const handleBackToInbox = () => {
    navigate('/direct/inbox');
  };

  const containerClass = `${styles.container} ${selectedConversationId ? styles.hasSelection : ''}`;

  return (
    <div className={containerClass}>
      <div className={styles.list}>
        <ConversationList
          conversations={conversations}
          isLoading={isLoadingConversations}
          isLoadingMore={isLoadingMoreConversations}
          hasNext={hasNextConversations}
          onLoadMore={loadMoreConversations}
          selectedConversationId={selectedConversationId}
          onSelect={handleSelect}
        />
      </div>

      {selectedConversation ? (
        <div className={styles.pane}>
          <MessagePane conversation={selectedConversation} onBack={handleBackToInbox} />
        </div>
      ) : (
        <main className={`${styles.main} ${styles.pane}`}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaRegPaperPlane size={48} />
            </div>
            <h2 className={styles.emptyTitle}>내 메시지</h2>
            <p className={styles.emptyHint}>친구에게 메시지를 보내보세요.</p>
          </div>
        </main>
      )}
    </div>
  );
};

export default DirectPage;
