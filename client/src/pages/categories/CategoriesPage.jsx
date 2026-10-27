import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Loader2 } from 'lucide-react';
import api from '../../services/api.js';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-bold font-heading text-white">Product Categories</h1>
        <p className="text-slate-400 mt-2">
          Discover our curated departments, from cutting-edge electronics to modern fashion and home living essentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/products?category=${cat.slug}`}
            className="group relative h-[380px] rounded-3xl overflow-hidden glass-card border border-slate-800 hover:border-indigo-500/50 transition-all duration-500 flex flex-col justify-end p-8"
          >
            <img
              src={cat.image?.secure_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop'}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 inline-block">
                Department
              </span>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {cat.name}
              </h2>
              <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                {cat.description || 'Explore the complete collection with free shipping and authentic guarantee.'}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
