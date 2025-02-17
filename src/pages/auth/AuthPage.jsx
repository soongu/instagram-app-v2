// src/pages/auth/AuthPage.jsx

import {useSelector} from "react-redux";
import LoginPage from "./LoginPage.jsx";
import FeedPage from "../feed/FeedPage.jsx";

const AuthPage = () => {
  const isAuthenticated = useSelector(state => state.auth.accessToken);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <FeedPage />;
};

export default AuthPage;