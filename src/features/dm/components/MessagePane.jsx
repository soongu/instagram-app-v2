import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPhone, FaVideo, FaCircleInfo, FaChevronLeft } from 'react-icons/fa6';
import defaultProfileImage from '../../../assets/images/default-profile.svg';
import { conversationApi } from '../../../services/api';
import { send as stompSend } from '../../../lib/websocket/stompClient';
import { clearUnread } from '../../../store/dmSlice';
import { onDmReceived } from '../dmEvents';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';
import NewMessagesDivider from './NewMessagesDivider';
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

// 현재 로드된 chronologicalMessages 중 "N 번째로 최근의 상대 메시지" 의 messageId 를 반환한다.
// 그 메시지 바로 앞에 "New messages" 구분선이 놓인다.
const computeNewMessagesBoundary = (messages, unreadCount, myUsername) => {
  if (unreadCount <= 0) return null;
  let seen = 0;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.senderUsername !== myUsername) {
      seen += 1;
      if (seen === unreadCount) return m.messageId;
    }
  }
  // 모두 unread 인 경우 → 맨 처음 상대 메시지 앞에 표시
  return messages.find((m) => m.senderUsername !== myUsername)?.messageId ?? null;
};

const MessagePane = ({ conversation, onBack }) => {
  const conversationId = conversation?.conversationId ?? null;
  const myUsername = useSelector((state) => state.auth.user?.username);
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]); // oldest → newest
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  // 진입 시 markAllRead 가 flip 시킨 메시지 수 — "New messages" 구분선 배치에 사용
  const [newMessagesBoundaryId, setNewMessagesBoundaryId] = useState(null);
  const cursorRef = useRef(null); // next cursor = oldest messageId in buffer
  const scrollRef = useRef(null);
  const isFetchingRef = useRef(false);
  // 과거 페이지 prepend 시 스크롤 점프 방지용
  const preserveScrollRef = useRef(null);
  // 최초 페이지 로드 후 한번만 바닥으로 스냅하기 위한 플래그
  const hasSnappedToBottomRef = useRef(false);

  // 대화방 진입 시 초기화 + 최초 페이지 로드 + 읽음 처리
  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;
    setMessages([]);
    setHasNext(false);
    setNewMessagesBoundaryId(null);
    cursorRef.current = null;
    hasSnappedToBottomRef.current = false;
    setIsLoading(true);
    dispatch(clearUnread(conversationId));

    const loadInitial = async () => {
      try {
        const [sliceRes, newlyReadCount] = await Promise.all([
          conversationApi.getMessages(conversationId, null, PAGE_SIZE),
          conversationApi.markAllRead(conversationId).catch((err) => {
            console.warn('[DM] markAllRead 실패:', err);
            return 0;
          }),
        ]);
        if (cancelled) return;
        const page = sliceRes?.content ?? [];
        // API 는 최신 → 과거. UI 는 과거 → 최신으로 뒤집어 렌더.
        const chronological = [...page].reverse();
        setMessages(chronological);
        setHasNext(sliceRes?.hasNext ?? false);
        if (page.length > 0) cursorRef.current = page[page.length - 1].messageId;

        const boundary = computeNewMessagesBoundary(chronological, newlyReadCount | 0, myUsername);
        setNewMessagesBoundaryId(boundary);
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
  }, [conversationId, dispatch, myUsername]);

  // 스크롤 동기화:
  // 1) 과거 페이지 prepend → 직전 스냅샷으로 위치 복원 (점프 방지)
  // 2) 초기 로드 직후 → 맨 아래로 스냅 (한 번만)
  // 3) 이후 메시지 append → 사용자가 이미 바닥 근처일 때만 바닥 유지
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const snapshot = preserveScrollRef.current;
    if (snapshot) {
      el.scrollTop = el.scrollHeight - snapshot.scrollHeight + snapshot.scrollTop;
      preserveScrollRef.current = null;
      return;
    }

    if (isLoading || messages.length === 0) return;

    if (!hasSnappedToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      hasSnappedToBottomRef.current = true;
      return;
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 200) {
      el.scrollTop = el.scrollHeight;
    }
  }, [isLoading, messages]);

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

  // 이 대화방으로 들어오는 실시간 DM 을 append.
  // 서버는 보낸 본인에게도 동일한 DTO 를 echo 하므로 이 한 갈래로 내/상대 메시지 모두 처리된다.
  useEffect(() => {
    if (!conversationId) return;
    const off = onDmReceived((incoming) => {
      if (incoming.conversationId !== conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.messageId === incoming.messageId)) return prev;
        return [...prev, incoming];
      });

      // 상대가 보낸 메시지면, 대화방이 열려 있으므로 바로 읽음 처리
      if (incoming.senderUsername !== myUsername) {
        conversationApi.markAllRead(conversationId).catch(() => {});
      }
    });
    return off;
  }, [conversationId, myUsername]);

  const handleSend = (text) => {
    if (!conversationId) return false;
    const ok = stompSend('/app/dm.send', { conversationId, content: text });
    if (!ok) {
      console.warn('[DM] STOMP 미연결 — 전송 실패');
      return false;
    }
    return true;
  };

  if (!conversation) return null;

  return (
    <section className={styles.pane}>
      <header className={styles.header}>
        <div className={styles.headerUser}>
          {onBack && (
            <button
              type="button"
              className={styles.backButton}
              onClick={onBack}
              aria-label="대화방 목록으로"
            >
              <FaChevronLeft size={20} />
            </button>
          )}
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
            const showNewDivider = newMessagesBoundaryId === m.messageId;

            return (
              <div key={m.messageId}>
                {showDate && <DateDivider dateString={m.createdAt} />}
                {showNewDivider && <NewMessagesDivider />}
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
