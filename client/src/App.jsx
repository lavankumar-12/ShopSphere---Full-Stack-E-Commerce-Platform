import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ProductsPage from './pages/products/ProductsPage.jsx';
import ProductDetailsPage from './pages/products/ProductDetailsPage.jsx';
import CategoriesPage from './pages/categories/CategoriesPage.jsx';
import WishlistPage from './pages/wishlist/WishlistPage.jsx';
import CartPage from './pages/cart/CartPage.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import OrderSuccessPage from './pages/checkout/OrderSuccessPage.jsx';
import OrdersPage from './pages/orders/OrdersPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import { setCredentials, logoutUser, setAuthLoading } from './store/slices/authSlice.js';
import { setCart } from './store/slices/cartSlice.js';
import { setWishlist } from './store/slices/wishlistSlice.js';
import api from './services/api.js';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && token) {
        try {
          dispatch(setAuthLoading(true));
          // Fetch user profile, cart, and wishlist in parallel
          const [userRes, cartRes, wishlistRes] = await Promise.all([
            api.get('/auth/me'),
            api.get('/cart').catch(() => null),
            api.get('/wishlist').catch(() => null),
          ]);

          dispatch(setCredentials({ user: userRes.data.data.user, token }));
          if (cartRes && cartRes.data.data) {
            dispatch(setCart(cartRes.data.data));
          }
          if (wishlistRes && wishlistRes.data.data) {
            dispatch(setWishlist(wishlistRes.data.data));
          }
        } catch (error) {
          console.error('Session expired or error fetching user:', error);
          dispatch(logoutUser());
        } finally {
          dispatch(setAuthLoading(false));
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, token, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Customer Protected Routes */}
        <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="order/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/products" element={<ProtectedRoute adminOnly={true}><AdminProducts /></ProtectedRoute>} />
        <Route path="admin/orders" element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
