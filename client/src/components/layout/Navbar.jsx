import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Sparkles,
  Package,
  Layers,
  Compass,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice.js';
import { toggleMobileMenu, toggleCartDrawer } from '../../store/slices/uiSlice.js';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { products: wishlistItems } = useSelector((state) => state.wishlist);
  const { isMobileMenuOpen } = useSelector((state) => state.ui);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalCartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      if (isMobileMenuOpen) dispatch(toggleMobileMenu());
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-heading tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Shop<span className="gradient-text">Sphere</span>
            </span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 ml-6">
            <Link
              to="/products"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Collection
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/products?category=featured"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Featured
            </Link>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm mx-6 relative"
          >
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/60 rounded-full text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-full hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems?.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="p-2.5 rounded-full hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Actions */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-800/60 border border-slate-700/40 text-slate-200 text-sm font-medium transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-md">
                          ADMINISTRATOR
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" /> My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                    >
                      <Package className="w-4 h-4 text-emerald-400" /> Order History
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                    >
                      <Heart className="w-4 h-4 text-pink-400" /> Saved Wishlist
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 transition-colors border-t border-slate-800/60"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-400" /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-md shadow-indigo-600/20"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer/Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 backdrop-blur-xl px-4 pt-4 pb-6 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <nav className="space-y-1 text-sm font-medium">
            <Link
              to="/products"
              onClick={() => dispatch(toggleMobileMenu())}
              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
            >
              <Compass className="w-4 h-4 text-indigo-400" /> Full Catalog
            </Link>
            <Link
              to="/categories"
              onClick={() => dispatch(toggleMobileMenu())}
              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
            >
              <Layers className="w-4 h-4 text-purple-400" /> Categories
            </Link>
            <Link
              to="/wishlist"
              onClick={() => dispatch(toggleMobileMenu())}
              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
            >
              <Heart className="w-4 h-4 text-pink-400" /> Wishlist ({wishlistItems.length})
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
                >
                  <Package className="w-4 h-4 text-emerald-400" /> Order History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
                >
                  <User className="w-4 h-4 text-blue-400" /> My Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => dispatch(toggleMobileMenu())}
                    className="flex items-center gap-3 px-3 py-2.5 text-purple-300 hover:bg-purple-950/40 rounded-xl"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-400" /> Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
