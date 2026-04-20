import { useEffect, useRef, useState } from 'react';
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

  const parsedId = conversationIdParam ? Number(conversationIdParam) : null;

  // 실시간 DM 수신 시 대화방 목록 prepend + 마지막 메시지/시각 갱신.
  // 알 수 없는 conversationId 가 오면 목록을 REST 로 재조회.
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  useEffect(() => {
    if (parsedId) dispatch(setSelectedConversation(parsedId));
    else dispatch(clearSelectedConversation());
  }, [parsedId, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await conversationApi.list();
        if (!cancelled) setConversations(data ?? []);
      } catch (err) {
        console.error('[DM] 대화방 목록 조회 실패:', err);
        if (!cancelled) setConversations([]);
      } finally {
        if (!cancelled) setIsLoadingConversations(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return onDmReceived((incoming) => {
      if (!incoming?.conversationId) return;
      const current = conversationsRef.current;
      const idx = current.findIndex((c) => c.conversationId === incoming.conversationId);

      if (idx === -1) {
        // 새 대화방 (상대가 처음으로 메시지를 보낸 경우 등) — 목록 재조회
        conversationApi.list()
          .then((data) => setConversations(data ?? []))
          .catch((err) => console.warn('[DM] 대화방 목록 재조회 실패:', err));
        return;
      }

      const updated = {
        ...current[idx],
        lastMessage: incoming.content,
        lastMessageAt: incoming.createdAt,
      };
      // 해당 항목을 최상단으로 끌어올림
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

  return (
    <div className={styles.container}>
      <ConversationList
        conversations={conversations}
        isLoading={isLoadingConversations}
        selectedConversationId={selectedConversationId}
        onSelect={handleSelect}
      />

      {selectedConversation ? (
        <MessagePane conversation={selectedConversation} />
      ) : (
        <main className={styles.main}>
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
