import {useSelector} from "react-redux";
import LoginPage from "./LoginPage.jsx";

const AuthPage = () => {
  const isAuthenticated = useSelector(state => state.auth.accessToken);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <div>welcome</div>;
};

export default AuthPage;