import { useEffect, useState } from 'react';
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
import styles from './DirectPage.module.scss';

const DirectPage = () => {
  const { conversationId: conversationIdParam } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedConversationId = useSelector((state) => state.dm.selectedConversationId);

  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const parsedId = conversationIdParam ? Number(conversationIdParam) : null;

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
