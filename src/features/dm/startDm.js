import { conversationApi, profileApi } from '../../services/api';

// 이미 알고 있는 memberId 로 1:1 대화방을 확보한 뒤 해당 대화방으로 이동.
export const startDmWithMemberId = async (memberId, navigate) => {
  if (!memberId) throw new Error('memberId is required');
  const conversation = await conversationApi.createOrGet(memberId);
  const id = conversation?.conversationId;
  if (!id) throw new Error('conversation not returned');
  navigate(`/direct/t/${id}`);
  return id;
};

// username 만 아는 진입점(피드 액션 등). 프로필 헤더로 memberId 를 한번 조회한 뒤 위 헬퍼에 위임.
export const startDmWithUsername = async (username, navigate) => {
  if (!username) throw new Error('username is required');
  const profile = await profileApi.getProfile(username);
  const memberId = profile?.memberId;
  if (!memberId) throw new Error(`memberId not found for ${username}`);
  return startDmWithMemberId(memberId, navigate);
};
