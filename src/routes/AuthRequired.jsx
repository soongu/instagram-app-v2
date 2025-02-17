// src/routes/AuthRequired.jsx

// AuthRequired 컴포넌트
import RootLayout from "../layouts/RootLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import {useSelector} from "react-redux";

const AuthRequired = () => {
  const isAuthenticated = useSelector(state => state.auth.accessToken);

  if (!isAuthenticated) {
    return <AuthLayout isLoginPage={true}/>;
  }

  return <RootLayout/>;
};

export default AuthRequired;