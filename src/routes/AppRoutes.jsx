// src/routes/AppRoutes.jsx

import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import AuthRequired from "./AuthRequired.jsx";
import AuthPage from "../pages/auth/AuthPage.jsx";
import ProfilePage from "../pages/profile/ProfilePage.jsx";
import {profileApi} from "../services/api.js";

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthRequired/>,
    children: [
      {
        index: true,
        element: <AuthPage/>
      },
      {
        path: ':username',
        element: <ProfilePage/>,
        loader: async ({params}) => {
          try {
            const response = await profileApi.getProfile(params.username);
            return response;
          } catch (error) {
            console.error('Profile loader error:', error);
            // 인증 에러 등일 때 라우터 컴포넌트 내부(AuthRequired 등)에서
            // 처리할 수 있도록 null이나 기본 객체를 넘기거나 에러를 throw하여 ErrorBoundary가 잡게 합니다.
            // 하지만 지금은 보호된 라우트이므로 그냥 null 리턴.
            return null;
          }
        },
      }
    ]
  },
  {
    path: '/signup',
    element: <AuthLayout isLoginPage={false}/>,
    children: [
      {
        index: true,
        element: <SignupPage/>
      }
    ]
  },
  // 잘못된 경로로 접근시 홈으로 리다이렉트
  {
    path: '*',
    element: <Navigate to="/" replace/>
  }
]);


const AppRoutes = () => {

  return (
    <RouterProvider router={router}/>
  );
};

export default AppRoutes;