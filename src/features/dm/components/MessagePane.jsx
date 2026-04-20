import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPhone, FaVideo, FaCircleInfo } from 'react-icons/fa6';
import defaultProfileImage from '../../../assets/images/default-profile.svg';
import { conversationApi } from '../../../services/api';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';
import MessageInput from './MessageInput';
import styles from './MessagePane.module.scss';

const PAGE_SIZE = 20;

// 같은 날짜(YYYY-MM-DD) 여부
const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// 버블 position: 같은 발신자 연속 발화 그룹 내에서 single | first | middle | last
const computePosition = (messages, index) => {
  const cur = messages[index];
  const prev = messages[index - 1];
  const next = messages[index + 1];

  const sameAsPrev = prev && prev.senderId === cur.senderId && isSameDay(prev.createdAt, cur.createdAt);
  const sameAsNext = next && next.senderId === cur.senderId && isSameDay(next.createdAt, cur.createdAt);

  if (!sameAsPrev && !sameAsNext) return 'single';
  if (!sameAsPrev && sameAsNext) return 'first';
  if (sameAsPrev && sameAsNext) return 'middle';
  return 'last';
};

const MessagePane = ({ conversation }) => {
  const conversationId = conversation?.conversationId ?? null;
  const myUsername = useSelector((state) => state.auth.user?.username);

  const [messages, setMessages] = useState([]); // oldest → newest
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const cursorRef = useRef(null); // next cursor = oldest messageId in buffer
  const scrollRef = useRef(null);
  const isFetchingRef = useRef(false);
  // 과거 페이지 prepend 시 스크롤 점프 방지용
  const preserveScrollRef = useRef(null);

  // 대화방 진입 시 초기화 + 최초 페이지 로드 + 읽음 처리
  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;
    setMessages([]);
    setHasNext(false);
    cursorRef.current = null;
    setIsLoading(true);

    const loadInitial = async () => {
      try {
        const [sliceRes] = await Promise.all([
          conversationApi.getMessages(conversationId, null, PAGE_SIZE),
          conversationApi.markAllRead(conversationId).catch((err) => {
            console.warn('[DM] markAllRead 실패:', err);
          }),
        ]);
        if (cancelled) return;
        const page = sliceRes?.content ?? [];
        // API 는 최신 → 과거. UI 는 과거 → 최신으로 뒤집어 렌더.
        const chronological = [...page].reverse();
        setMessages(chronological);
        setHasNext(sliceRes?.hasNext ?? false);
        if (page.length > 0) cursorRef.current = page[page.length - 1].messageId;
      } catch (err) {
        console.error('[DM] 메시지 이력 조회 실패:', err);
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // 초기 로드 후 스크롤을 맨 아래로
  useLayoutEffect(() => {
    if (!isLoading && scrollRef.current && messages.length > 0 && preserveScrollRef.current == null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isLoading, messages]);

  // prepend 된 과거 메시지로 인해 스크롤이 점프하지 않도록 복원
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const snapshot = preserveScrollRef.current;
    if (!el || !snapshot) return;
    el.scrollTop = el.scrollHeight - snapshot.scrollHeight + snapshot.scrollTop;
    preserveScrollRef.current = null;
  }, [messages]);

  const loadOlder = useCallback(async () => {
    if (isFetchingRef.current || !hasNext || !conversationId) return;
    isFetchingRef.current = true;
    setIsLoadingOlder(true);
    try {
      const sliceRes = await conversationApi.getMessages(conversationId, cursorRef.current, PAGE_SIZE);
      const page = sliceRes?.content ?? [];
      const chronological = [...page].reverse();
      if (scrollRef.current) {
        preserveScrollRef.current = {
          scrollHeight: scrollRef.current.scrollHeight,
          scrollTop: scrollRef.current.scrollTop,
        };
      }
      setMessages((prev) => [...chronological, ...prev]);
      setHasNext(sliceRes?.hasNext ?? false);
      if (page.length > 0) cursorRef.current = page[page.length - 1].messageId;
    } catch (err) {
      console.error('[DM] 과거 메시지 로딩 실패:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [hasNext, conversationId]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 80 && hasNext && !isFetchingRef.current) {
      loadOlder();
    }
  }, [hasNext, loadOlder]);

  const handleSend = (text) => {
    // 실제 STOMP 전송은 다음 커밋에서. 현재는 UX 를 막지 않기 위해 값만 반환 false 로 두고 input 비움.
    console.log('[DM] send (pending STOMP wiring):', { conversationId, text });
  };

  if (!conversation) return null;

  return (
    <section className={styles.pane}>
      <header className={styles.header}>
        <div className={styles.headerUser}>
          <img
            src={conversation.otherMemberProfileImageUrl || defaultProfileImage}
            alt={conversation.otherMemberUsername}
            className={styles.headerAvatar}
          />
          <div className={styles.headerText}>
            <div className={styles.headerName}>{conversation.otherMemberUsername}님</div>
            <div className={styles.headerUsername}>{conversation.otherMemberUsername}</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.headerIcon} aria-label="음성 통화">
            <FaPhone size={22} />
          </button>
          <button type="button" className={styles.headerIcon} aria-label="영상 통화">
            <FaVideo size={22} />
          </button>
          <button type="button" className={styles.headerIcon} aria-label="정보">
            <FaCircleInfo size={22} />
          </button>
        </div>
      </header>

      <div className={styles.scroll} ref={scrollRef} onScroll={handleScroll}>
        {isLoadingOlder && (
          <div className={styles.loadingOlder}>
            <div className={styles.spinner} />
          </div>
        )}

        {isLoading ? (
          <div className={styles.loadingInitial}>
            <div className={styles.spinner} />
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>아직 메시지가 없습니다. 대화를 시작해 보세요!</div>
        ) : (
          messages.map((m, idx) => {
            const isMine = m.senderUsername === myUsername;
            const prev = messages[idx - 1];
            const showDate = !prev || !isSameDay(prev.createdAt, m.createdAt);
            const position = computePosition(messages, idx);
            const showAvatar = !isMine && position !== 'first' && position !== 'middle';

            return (
              <div key={m.messageId}>
                {showDate && <DateDivider dateString={m.createdAt} />}
                <MessageBubble
                  message={m}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  avatarUrl={conversation.otherMemberProfileImageUrl}
                  position={position}
                />
              </div>
            );
          })
        )}
      </div>

      <MessageInput onSend={handleSend} />
    </section>
  );
};

export default MessagePane;
