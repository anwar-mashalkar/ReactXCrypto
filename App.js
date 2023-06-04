import { Provider } from 'mobx-react';
import walletStore from './src/store/WalletStore';
import HomeScreen from './src/screens/HomeScreen';
const App = () => {
  return (
    <Provider walletStore={walletStore}>
      <HomeScreen/>
    </Provider>
  );
};

export default App;
