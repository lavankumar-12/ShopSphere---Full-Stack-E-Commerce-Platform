import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-card p-10 sm:p-14 rounded-3xl max-w-lg w-full text-center border border-slate-800 shadow-2xl">
        <span className="text-7xl font-extrabold font-heading text-indigo-500 tracking-wider">
          404
        </span>
        <h1 className="text-3xl font-bold font-heading text-white mt-4 mb-3">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved to another location.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            to="/products"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" /> Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
