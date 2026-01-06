import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ApiProvider, CartProvider, NotificationProvider } from './contexts/index.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Specials from './pages/Specials/Specials';

import Login from './pages/Login/Login';
import Account from './pages/Account/Account';
import Profile from './pages/Profile/Profile';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import Admin from './pages/Admin/Admin';
import ProductDetail from './pages/ProductDetail/ProductDetail';

const AppContent = () => {
  const location = useLocation();

  // ✅ Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // ✅ Detect admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App min-h-screen flex flex-col">
      {/* Header only for non-admin */}
      {!isAdminRoute && <Header />}

      {/* Main content area */}
      <main className={`flex-1 ${isAdminRoute ? 'route-container' : 'route-container pt-[120px]'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/specials" element={<Specials />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer only for non-admin */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  useEffect(() => {
    document.body.style.visibility = 'visible';
  }, []);

  return (
    <ApiProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </NotificationProvider>
    </ApiProvider>
  );
}

export default App;
