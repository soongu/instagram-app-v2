import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegPaperPlane } from 'react-icons/fa6';
import ConversationList from '../../features/dm/components/ConversationList';
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

  const parsedId = conversationIdParam ? Number(conversationIdParam) : null;

  useEffect(() => {
    if (parsedId) dispatch(setSelectedConversation(parsedId));
    else dispatch(clearSelectedConversation());
  }, [parsedId, dispatch]);

  const handleSelect = (conversationId) => {
    navigate(`/direct/t/${conversationId}`);
  };

  return (
    <div className={styles.container}>
      <ConversationList
        selectedConversationId={selectedConversationId}
        onSelect={handleSelect}
      />

      <main className={styles.main}>
        {selectedConversationId ? (
          <div className={styles.placeholder}>대화를 선택했습니다 (메시지 뷰 준비 중)</div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaRegPaperPlane size={48} />
            </div>
            <h2 className={styles.emptyTitle}>내 메시지</h2>
            <p className={styles.emptyHint}>친구에게 메시지를 보내보세요.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DirectPage;
