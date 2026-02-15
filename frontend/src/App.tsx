import AppRoutes from './routes/AppRoutes';

// import { CartProvider } from './context/CartContext';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-text-primary bg-gray-50">
      <AuthProvider>
        {/* CartProvider Removed */}
          <AppRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;
