import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ApiProvider } from './context/ApiContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Specials from './pages/Specials/Specials';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import Account from './pages/Account/Account';
import Profile from './pages/Profile/Profile';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Payment from './pages/Payment/Payment';
import Orders from './pages/Orders/Orders';
import Admin from './pages/Admin/Admin';

const AppContent = () => {
  const location = useLocation();

  // ✅ Detect admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {/* Header only for non-admin */}
      {!isAdminRoute && <Header />}

      {/* ✅ Conditional padding */}
      <div className={isAdminRoute ? 'route-container' : 'route-container pt-[120px]'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/specials" element={<Specials />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
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
      </div>

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
