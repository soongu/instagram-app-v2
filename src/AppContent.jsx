// src/AppContent.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from './services/api';
import { clearToken, setUser } from './features/auth/authSlice';
import AppRoutes from './routes/AppRoutes';

const AppContent = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(state => state.auth.accessToken);

  useEffect(() => {
    console.log('useEffect in AppContent');
    const fetchUser = async () => {
      if (accessToken) {
        try {
          const response = await authApi.getCurrentUser();
          dispatch(setUser(response.data));
        } catch (error) {
          dispatch(clearToken());
        }
      }
    };

    fetchUser();
  }, [accessToken]);

  return <AppRoutes />;
};

export default AppContent;