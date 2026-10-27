import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import CartDrawer from '../components/cart/CartDrawer.jsx';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
};

export default MainLayout;
