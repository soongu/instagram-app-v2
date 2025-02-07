
// 라우터 설정
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import './styles/global.scss';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // children: [
    //   {
    //     index: true,
    //     element: <HomePage />
    //   },
    //   // 다른 인증이 필요한 라우트들은 나중에 추가
    // ]
  },
  // {
  //   element: <AuthLayout />,
  //   children: [
  //     {
  //       path: 'login',
  //       element: <LoginPage />
  //     },
  //     {
  //       path: 'signup',
  //       element: <SignupPage />
  //     }
  //   ]
  // }
]);


const App = () => {

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
