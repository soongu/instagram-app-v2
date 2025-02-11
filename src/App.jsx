
// 라우터 설정
import './styles/global.scss';
import {Provider} from "react-redux";
import {store} from "./store/index";
import AppRoutes from "./routes/AppRoutes.jsx";



const App = () => {

  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;
