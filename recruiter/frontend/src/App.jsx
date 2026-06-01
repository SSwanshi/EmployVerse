import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </Provider>
  );
}

export default App;
