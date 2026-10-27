import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, X, Image as ImageIcon, Check, Layers, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImg, setNewCatImg] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.data.products || []);
      setCategories(catRes.data.data || []);
      if (catRes.data.data?.length > 0 && !category) {
        setCategory(catRes.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load products or categories');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?._id || '');
    setBrand('ShopSphere');
    setPrice('');
    setDiscountPrice('');
    setStock('15');
    setDescription('');
    setImageUrl('');
    setIsFeatured(false);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setCategory(p.category?._id || p.category || categories[0]?._id || '');
    setBrand(p.brand || '');
    setPrice(String(p.price || ''));
    setDiscountPrice(p.discountPrice ? String(p.discountPrice) : '');
    setStock(String(p.stock ?? 10));
    setDescription(p.description || '');
    setImageUrl(p.images?.[0]?.secure_url || '');
    setIsFeatured(!!p.isFeatured);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) {
      toast.error('Name, Category, and Price are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        category,
        brand,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stock: Number(stock) || 0,
        description: description || 'High-performance crafted product by ShopSphere.',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
        isFeatured,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully!');
      }

      setIsProductModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSubmittingCat(true);
      await api.post('/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        imageUrl: newCatImg.trim() || undefined,
      });
      toast.success('Category created!');
      setNewCatName('');
      setNewCatDesc('');
      setNewCatImg('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to create category');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Cannot delete category');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Product Management</h1>
          <p className="text-slate-400 mt-1">Manage catalog inventory, pricing, and category classifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl flex items-center gap-2 transition-all border border-slate-700/60"
          >
            <Layers className="w-4 h-4 text-indigo-400" /> Categories ({categories.length})
          </button>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-5 h-5" /> Add New Product
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50">
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by title, category, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                        <img
                          src={product.images?.[0]?.secure_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-white line-clamp-1 block">{product.name}</span>
                        <span className="text-xs text-slate-400">{product.brand || 'ShopSphere'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-300">
                      {product.category?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${(product.price || 0).toFixed(2)}
                      {product.discountPrice && (
                        <span className="block text-xs text-pink-400 font-normal">
                          Sale: ${product.discountPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          product.stock > 10
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.isFeatured ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          title="Delete product"
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Product Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Minimalist Wireless Speaker"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 capitalize"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. ShopSphere"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Regular Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="199.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="149.99"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Inventory Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Comprehensive description of the product..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeaturedCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="isFeaturedCheck" className="text-xs text-slate-300 cursor-pointer">
                  Feature this product on homepage hero & showcase
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Manage Categories
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Existing Categories
              </h3>
              <div className="space-y-2">
                {categories.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {c.image?.secure_url && (
                        <img
                          src={c.image.secure_url}
                          alt={c.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <span className="font-semibold text-white text-sm block">{c.name}</span>
                        <span className="text-xs text-slate-500">slug: {c.slug}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c._id, c.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleCreateCategory} className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Add New Category
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">Category Name *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Gaming Gear"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">Description</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Brief description of products in this category"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">Image URL</label>
                <input
                  type="url"
                  value={newCatImg}
                  onChange={(e) => setNewCatImg(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingCat}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
              >
                {submittingCat ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '+ Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
