// src/hooks/useLikeStatus.js
import { useState, useEffect } from "react";
import { likeApi } from "../services/api";

const useLikeStatus = (postId, initialLikeStatus) => {
  const [likeStatus, setLikeStatus] = useState(initialLikeStatus);

  useEffect(() => {
    if (initialLikeStatus) {
      setLikeStatus(initialLikeStatus);
    }
  }, [initialLikeStatus]);

  const toggleLike = async () => {
    const newLiked = !likeStatus.liked;
    const newLikeCount = newLiked ? likeStatus.likeCount + 1 : likeStatus.likeCount - 1;
    const newLikeStatus = { liked: newLiked, likeCount: newLikeCount };

    setLikeStatus(newLikeStatus); // ✅ UI 먼저 업데이트 (낙관적 업데이트)

    try {
      const response = await likeApi.toggleLike(postId);
      setLikeStatus(response.data); // ✅ 서버 응답으로 최종 업데이트
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      setLikeStatus(initialLikeStatus); // 실패 시 원래 상태로 복구
    }
  };

  return { likeStatus, toggleLike };
};

export default useLikeStatus;
