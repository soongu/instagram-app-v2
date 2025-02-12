// hooks/useIsMyProfile.js
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export const useIsMyProfile = () => {
  const { username: pageUsername } = useParams();
  const storedUsername = useSelector(state => state.auth.username);

  return storedUsername === pageUsername;
};