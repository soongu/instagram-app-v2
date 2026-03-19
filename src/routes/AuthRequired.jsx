// src/routes/AuthRequired.jsx

// AuthRequired 컴포넌트
import RootLayout from "../layouts/RootLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import {useSelector} from "react-redux";
import {Navigate, useLocation} from "react-router-dom";

const AuthRequired = () => {
  const isAuthenticated = useSelector(state => state.auth.accessToken);
  const location = useLocation();

  if (!isAuthenticated) {
    if (location.pathname !== '/') {
      return <Navigate to="/" replace />;
    }
    return <AuthLayout isLoginPage={true}/>;
  }

  return <RootLayout/>;
};

export default AuthRequired;