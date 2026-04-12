// src/utils/formatter.jsx

// 해시태그를 링크로 변환하는 함수
import {Link} from "react-router-dom";
import { store } from "../store/index";
import { closePostModal } from "../store/postModalSlice";

export const convertHashtagsToJsx = (content, onMentionClick = null) => {
  if (!content) return null;
  const words = content.split(/(\s+)/);  // 공백을 포함하여 분할

  return words.map((word, index) => {
    if (word.startsWith('#')) {
      const hashtag = word.substring(1); // # 제거
      return (
        <Link
          key={index}
          to={`/explore/search/keyword?q=${encodeURIComponent(`#${hashtag}`)}`}
          className="hashtag-link"
          onClick={(e) => {
            // 모달이 열린 상태에서 해시태그를 클릭하면, 라우팅 전에 모달을 먼저 닫습니다.
            // (라우트 전환 시 기존 모달이 언마운트되며 "라우트 변경 감지"를 놓칠 수 있음)
            e.stopPropagation();
            store.dispatch(closePostModal());
          }}
        >
          {word}
        </Link>
      );
    }
    if (word.startsWith('@') && word.length > 1) {
      const mention = word.substring(1).replace(/[^a-zA-Z0-9_.]/g, ''); // Extract valid username string usually
      return (
        <span
          key={index}
          className="mention-link"
          style={{ cursor: 'pointer', color: '#00376b', display: 'inline' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onMentionClick) onMentionClick(mention);
          }}
        >
          {word}
        </span>
      );
    }
    return word;
  });
};

// 숫자 축약 포맷 (10만 이상 → K / M / B)
export const formatCount = (value) => {
  const num = Number(value) || 0;
  if (num < 100_000) return num.toLocaleString();
  if (num < 1_000_000) return `${Math.floor(num / 1_000)}K`;
  if (num < 1_000_000_000) {
    const m = num / 1_000_000;
    return m >= 10 ? `${Math.floor(m)}M` : `${parseFloat(m.toFixed(1))}M`;
  }
  const b = num / 1_000_000_000;
  return b >= 10 ? `${Math.floor(b)}B` : `${parseFloat(b.toFixed(1))}B`;
};

// 날짜 포맷팅 함수
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // 초 단위 차이

  // 1분 미만
  if (diff < 60) {
    return '방금 전';
  }

  // 1시간 미만
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}분 전`;
  }

  // 24시간 미만
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}시간 전`;
  }

  // 7일 미만
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}일 전`;
  }

  // 그 외의 경우 년월일 표시
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};