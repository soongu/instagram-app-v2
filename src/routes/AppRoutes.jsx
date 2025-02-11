import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import AuthRequired from "./AuthRequred.jsx";
import AuthPage from "../pages/auth/AuthPage.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthRequired />,
    children: [
      {
        index: true,
        element: <AuthPage />
      }
    ]
  },
  {
    path: '/signup',
    element: <AuthLayout isLoginPage={false} />,
    children: [
      {
        index: true,
        element: <SignupPage />
      }
    ]
  },
  // 잘못된 경로로 접근시 홈으로 리다이렉트
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);



const AppRoutes = () => {

  return (
    <RouterProvider router={router}/>
  );
};

export default AppRoutes;