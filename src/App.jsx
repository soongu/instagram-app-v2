
// 라우터 설정
import './styles/global.scss';
import {Provider} from "react-redux";
import {store} from "./store/index";
import AppContent from "./AppContent.jsx";



const App = () => {

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
