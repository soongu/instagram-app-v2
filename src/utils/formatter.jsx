// src/utils/formatter.jsx

// 해시태그를 링크로 변환하는 함수
import {Link} from "react-router-dom";

export const convertHashtagsToJsx = (content) => {
  const words = content.split(/(\s+)/);  // 공백을 포함하여 분할

  return words.map((word, index) => {
    if (word.startsWith('#')) {
      const hashtag = word.substring(1); // # 제거
      return (
        <Link
          key={index}
          to={`/explore/search/keyword/?q=${hashtag}`}
          className="hashtag-link"
        >
          {word}
        </Link>
      );
    }
    return word;
  });
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