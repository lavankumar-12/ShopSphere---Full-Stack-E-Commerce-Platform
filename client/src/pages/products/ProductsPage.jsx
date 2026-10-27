import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Filter, ShoppingBag, Heart, ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';
import { setProducts, setProductLoading } from '../../store/slices/productSlice.js';
import { setCart } from '../../store/slices/cartSlice.js';
import { setWishlist } from '../../store/slices/wishlistSlice.js';
import { toggleCartDrawer } from '../../store/slices/uiSlice.js';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading, pagination } = useSelector((state) => state.products);
  const { products: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [addingCartId, setAddingCartId] = useState(null);

  // Filter local inputs
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const currentSearch = searchParams.get('search') || '';
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Error loading categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when search params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch(setProductLoading(true));
        const res = await api.get(`/products?${searchParams.toString()}`);
        dispatch(setProducts({
          products: res.data.data.products,
          pagination: res.data.data.pagination,
        }));
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        dispatch(setProductLoading(false));
      }
    };

    fetchProducts();
  }, [searchParams, dispatch]);

  const handleCategoryFilter = (catSlug) => {
    if (catSlug) searchParams.set('category', catSlug);
    else searchParams.delete('category');
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleSortChange = (sortValue) => {
    if (sortValue) searchParams.set('sort', sortValue);
    else searchParams.delete('sort');
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    if (minPrice) searchParams.set('minPrice', minPrice);
    else searchParams.delete('minPrice');
    if (maxPrice) searchParams.set('maxPrice', maxPrice);
    else searchParams.delete('maxPrice');
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', String(newPage));
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    try {
      setAddingCartId(product._id);
      const res = await api.post('/cart', { productId: product._id, quantity: 1 });
      dispatch(setCart(res.data.data));
      toast.success('Added to cart!');
      dispatch(toggleCartDrawer());
    } catch (error) {
      toast.error(error.message || 'Error adding to cart');
    } finally {
      setAddingCartId(null);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save items');
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/wishlist/${productId}`);
      dispatch(setWishlist(res.data.data));
      toast.success(res.data.message || 'Wishlist updated');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const isProductWishlisted = (id) => {
    return wishlistItems.some((item) => (item._id || item) === id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0">
        <div className="glass-card p-6 rounded-3xl sticky top-28 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Filters</h3>
            </div>
            {(currentCategory || minPrice || maxPrice || currentSearch) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Dynamic Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`block w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  !currentCategory
                    ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Departments
              </button>

              <button
                onClick={() => handleCategoryFilter('featured')}
                className={`block w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentCategory === 'featured'
                    ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Featured Highlights ✨
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryFilter(cat.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                    currentCategory === cat.slug
                      ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Price Range
            </h4>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Apply Price
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="flex-1">
        {/* Top bar with count & sorting */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">
              {currentCategory === 'featured'
                ? 'Featured Products'
                : currentCategory
                ? `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Collection`
                : 'All Products'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Showing {pagination.total || 0} product{pagination.total !== 1 ? 's' : ''}
              {currentSearch ? ` matching "${currentSearch}"` : ''}
            </p>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-white outline-none cursor-pointer focus:border-indigo-500"
            >
              <option value="-createdAt">Newest Releases</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-ratings">Highest Rated</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl h-[380px] animate-pulse bg-slate-800/30"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Products Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              We couldn't find any products matching your active filters. Try resetting the filters or searching for something else.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const currentPrice = product.discountPrice || product.price;
              const imageUrl = product.images?.[0]?.secure_url || '/placeholder.svg';
              const wishlisted = isProductWishlisted(product._id);

              return (
                <div
                  key={product._id}
                  className="glass-card rounded-2xl overflow-hidden group flex flex-col border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-lg"
                >
                  {/* Product Card Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-slate-900">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {product.discountPrice && (
                      <span className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                        SALE
                      </span>
                    )}

                    {product.isFeatured && (
                      <span className="absolute top-3 right-12 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                        FEATURED
                      </span>
                    )}

                    <button
                      onClick={() => handleToggleWishlist(product._id)}
                      title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                        wishlisted
                          ? 'bg-pink-500/30 text-pink-400 border border-pink-500/40'
                          : 'bg-slate-950/70 text-slate-400 hover:text-pink-400 hover:bg-slate-900'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-indigo-400 font-medium capitalize">
                        {product.category?.name || 'ShopSphere'}
                      </span>
                      {product.ratings > 0 && (
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{product.ratings}</span>
                        </div>
                      )}
                    </div>

                    <Link to={`/products/${product._id}`} className="block mb-2">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-indigo-300 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Footer / Buy Area */}
                    <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-white">${currentPrice.toFixed(2)}</span>
                        {product.discountPrice && (
                          <span className="text-xs text-slate-500 line-through ml-2">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingCartId === product._id || product.stock < 1}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                      >
                        {addingCartId === product._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        )}
                        {product.stock > 0 ? 'Add' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(pagination.pages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    pagination.page === pageNum
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
