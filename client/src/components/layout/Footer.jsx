import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      {/* Value Proposition Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Express Delivery</h4>
              <p className="text-xs text-slate-400">Free shipping on orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Buyer Protection</h4>
              <p className="text-xs text-slate-400">100% secure payments via Stripe</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Easy Returns</h4>
              <p className="text-xs text-slate-400">30-day money-back guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Flexible Payments</h4>
              <p className="text-xs text-slate-400">Cards, Apple Pay, & Wallet support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white font-heading">
                Shop<span className="gradient-text">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              Empowering global shoppers with cutting-edge electronics, fashion, and lifestyle products with seamless checkout and guaranteed quality.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products?category=electronics" className="hover:text-indigo-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-indigo-400 transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=home" className="hover:text-indigo-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-indigo-400 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Account & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/profile" className="hover:text-indigo-400 transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-400 transition-colors">Order Tracking</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-400 transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400 transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="cursor-pointer hover:text-indigo-400 transition-colors">About ShopSphere</span></li>
              <li><span className="cursor-pointer hover:text-indigo-400 transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-indigo-400 transition-colors">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-indigo-400 transition-colors">Contact Support</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</p>
        <p className="mt-4 md:mt-0">Built with MERN Stack • React, Express, MongoDB, Stripe, Resend</p>
      </div>
    </footer>
  );
};

export default Footer;
