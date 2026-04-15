import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { notificationApi } from '../../../services/api';
import { closeNotificationPanel } from '../../../store/notificationPanelSlice';
import { openPostModal } from '../../../store/postModalSlice';
import { formatDate } from '../../../utils/formatter.jsx';
import defaultProfileImage from '../../../assets/images/default-profile.svg';
import styles from './NotificationPanel.module.scss';

const NotificationPanel = () => {
  const isOpen = useSelector((state) => state.notificationPanel.isOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const cursorRef = useRef(null);
  const isFetchingRef = useRef(false);
  const sentinelRef = useRef(null);

  // 패널 열릴 때 알림 로드
  useEffect(() => {
    if (isOpen) {
      cursorRef.current = null;
      setNotifications([]);
      setHasNext(false);
      fetchNotifications();
    } else {
      setNotifications([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasNext(false);
      cursorRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // 라우트 변경 시 패널 닫기
  useEffect(() => {
    if (isOpen) dispatch(closeNotificationPanel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') dispatch(closeNotificationPanel());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications(null);
      const items = response?.items ?? [];
      setNotifications(items);
      setHasNext(response?.hasNext ?? false);
      if (items.length > 0) {
        cursorRef.current = items[items.length - 1].notificationId;
      }
    } catch (error) {
      console.error('알림 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasNext) return;
    isFetchingRef.current = true;
    setIsLoadingMore(true);
    try {
      const [response] = await Promise.all([
        notificationApi.getNotifications(cursorRef.current),
        new Promise((r) => setTimeout(r, 300)),
      ]);
      const items = response?.items ?? [];
      setNotifications((prev) => [...prev, ...items]);
      setHasNext(response?.hasNext ?? false);
      if (items.length > 0) {
        cursorRef.current = items[items.length - 1].notificationId;
      }
    } catch (error) {
      console.error('추가 알림 로딩 실패:', error);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasNext]);

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

  const handleNotificationClick = async (notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification.notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('읽음 처리 실패:', error);
      }
    }

    // 타입별 네비게이션
    if (notification.type === 'FOLLOW') {
      dispatch(closeNotificationPanel());
      navigate(`/${notification.senderUsername}`);
    } else if (notification.targetId) {
      // LIKE, COMMENT, MENTION → 게시물 모달
      dispatch(closeNotificationPanel());
      dispatch(openPostModal({ id: notification.targetId, context: 'feed' }));
    }
  };

  return (
    <div className={`${styles.notificationPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h2>알림</h2>
      </div>

      <hr className={styles.divider} />

      <div className={styles.content}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonTextGroup}>
                <div className={styles.skeletonMessage} />
                <div className={styles.skeletonTime} />
              </div>
            </div>
          ))
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((n) => (
              <div
                key={n.notificationId}
                className={`${styles.notificationItem} ${!n.isRead ? styles.unread : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className={styles.notificationAvatar}>
                  <img
                    src={n.senderProfileImageUrl || defaultProfileImage}
                    alt={n.senderUsername}
                  />
                </div>
                <div className={styles.notificationBody}>
                  <p className={styles.notificationMessage}>{n.message}</p>
                  <span className={styles.notificationTime}>{formatDate(n.createdAt)}</span>
                </div>
                {n.targetThumbnailUrl ? (
                  <div className={styles.notificationThumbnail}>
                    <img src={n.targetThumbnailUrl} alt="게시물" />
                  </div>
                ) : !n.isRead ? (
                  <div className={styles.unreadDot} />
                ) : null}
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
          <div className={styles.emptyState}>알림이 없습니다</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
