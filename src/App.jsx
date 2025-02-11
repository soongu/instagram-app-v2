
// 라우터 설정
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import './styles/global.scss';
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import {Provider} from "react-redux";
import {store} from "./store/index";

// 인증 여부를 판단하는 함수
const isAuthenticated = () => {
  // 실제로는 로컬 스토리지, 쿠키, 또는 Redux 등에서 인증 정보를 확인
  return false;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: isAuthenticated() ? <RootLayout /> : <AuthLayout isLoginPage={true} />,
    children: [
      {
        index: true,
        element: isAuthenticated() ? <div>welcome</div> : <LoginPage />
      },
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
  }

]);


const App = () => {

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default App;
