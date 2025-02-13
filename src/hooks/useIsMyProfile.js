// hooks/useIsMyProfile.js
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export const useIsMyProfile = () => {
  const { username: pageUsername } = useParams();
  const storedUser = useSelector(state => state.auth.user);

  return storedUser.username === pageUsername;
};