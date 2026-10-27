import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Package,
  Users,
  Tag,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  ExternalLink,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  TrendingUp,
  Layers,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, coupons, quick-product

  // User Management State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Coupon Management State
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minimumPurchase: '0',
    maximumDiscount: '',
    expiresAt: '',
    usageLimit: '',
  });

  // Quick Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [quickProduct, setQuickProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '15',
    brand: 'ShopSphere',
    description: '',
    imageUrl: '',
    isFeatured: false,
  });

  const fetchDashboardStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      const res = await api.get('/orders/dashboard-stats');
      setStats(res.data.data);
      if (isManualRefresh) toast.success('Dashboard metrics refreshed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/auth/users');
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load users list');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await api.get('/coupons');
      setCoupons(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load coupons list');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
      if (res.data.data?.length > 0 && !quickProduct.category) {
        setQuickProduct((prev) => ({ ...prev, category: res.data.data[0]._id }));
      }
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);

  // Order Operations
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId.substring(0, 8)} status updated to ${newStatus}`);
      // Update local state
      setStats((prev) => {
        if (!prev) return prev;
        const updatedRecent = prev.recentOrders?.map((ord) =>
          ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord
        );
        return { ...prev, recentOrders: updatedRecent };
      });
      fetchDashboardStats();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // Restock Product Operation
  const handleQuickRestock = async (productId, currentStock, productName, addedAmount = 10) => {
    try {
      const newStock = Number(currentStock || 0) + addedAmount;
      await api.put(`/products/${productId}`, { stock: newStock });
      toast.success(`Restocked ${productName} (+${addedAmount})! New stock: ${newStock}`);
      // Update in local stats
      setStats((prev) => {
        if (!prev) return prev;
        const updatedLowStock = prev.lowStockItems?.map((item) =>
          item._id === productId ? { ...item, stock: newStock } : item
        );
        return {
          ...prev,
          lowStockItems: updatedLowStock,
          lowStockProducts: Math.max(0, prev.lowStockProducts - (newStock >= 10 ? 1 : 0)),
        };
      });
      fetchDashboardStats();
    } catch (error) {
      toast.error('Failed to restock product');
    }
  };

  // User Operations
  const handleToggleBlockUser = async (userId, currentBlocked, userName) => {
    try {
      const res = await api.patch(`/auth/users/${userId}/block`);
      toast.success(res.data.message || `User status updated`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: !currentBlocked } : u))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle block status');
    }
  };

  const handleToggleUserRole = async (userId, currentRole, userName) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Change ${userName}'s role from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      toast.success(res.data.message || `Role updated`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;

    try {
      await api.delete(`/auth/users/${userId}`);
      toast.success(`User ${userName} deleted`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      fetchDashboardStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Coupon Operations
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue || !newCoupon.expiresAt) {
      toast.error('Please fill in required coupon fields');
      return;
    }

    try {
      await api.post('/coupons', {
        ...newCoupon,
        discountValue: Number(newCoupon.discountValue),
        minimumPurchase: Number(newCoupon.minimumPurchase || 0),
        maximumDiscount: newCoupon.maximumDiscount ? Number(newCoupon.maximumDiscount) : undefined,
        usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : undefined,
      });
      toast.success(`Coupon ${newCoupon.code.toUpperCase()} created successfully!`);
      setIsCouponModalOpen(false);
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minimumPurchase: '0',
        maximumDiscount: '',
        expiresAt: '',
        usageLimit: '',
      });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleToggleCouponActive = async (couponId) => {
    try {
      const res = await api.patch(`/coupons/${couponId}/toggle`);
      toast.success(res.data.message || 'Coupon status changed');
      setCoupons((prev) =>
        prev.map((c) => (c._id === couponId ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (error) {
      toast.error('Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success(`Coupon ${code} deleted`);
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  // Quick Product Creation
  const handleCreateQuickProduct = async (e) => {
    e.preventDefault();
    if (!quickProduct.name || !quickProduct.price || !quickProduct.category) {
      toast.error('Product Name, Category, and Price are required');
      return;
    }

    try {
      setSubmittingProduct(true);
      await api.post('/products', {
        ...quickProduct,
        price: Number(quickProduct.price),
        stock: Number(quickProduct.stock || 10),
        description: quickProduct.description || 'Premium product item available exclusively on ShopSphere.',
        imageUrl: quickProduct.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      });
      toast.success(`Product "${quickProduct.name}" created successfully!`);
      setIsProductModalOpen(false);
      setQuickProduct({
        name: '',
        category: categories[0]?._id || '',
        price: '',
        stock: '15',
        brand: 'ShopSphere',
        description: '',
        imageUrl: '',
        isFeatured: false,
      });
      fetchDashboardStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'SHIPPED':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'; // PENDING
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Loading Admin Operations Center...</h2>
        <p className="text-sm text-slate-400 mt-2">Connecting to live MongoDB database metrics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${Number(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      badge: '+12% this month',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      badge: 'All time',
    },
    {
      title: 'Action Needed (Pending)',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      badge: 'Needs fulfillment',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      badge: '< 10 in inventory',
    },
    {
      title: 'Customer Accounts',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      badge: 'Registered',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
              Admin Operations Center
            </h1>
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Live Operations
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time management for products, customer orders, users, and discount promotions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>

          <Link
            to="/admin/orders"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            Orders Page
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/40">
                  {stat.badge}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-slate-800 mb-8 overflow-x-auto space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Dashboard & Operations
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({stats?.totalUsers || 0})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'coupons'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          Coupons & Discounts
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LIVE OPERATIONS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Products Catalog</h4>
                  <p className="text-xs text-slate-400">Manage catalog & inventory</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/orders"
              className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Order Fulfillment</h4>
                  <p className="text-xs text-slate-400">Process shipping & statuses</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <button
              onClick={() => setActiveTab('users')}
              className="glass-card p-5 rounded-2xl flex items-center justify-between text-left group hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Users & Roles</h4>
                  <p className="text-xs text-slate-400">Manage access & bans</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className="glass-card p-5 rounded-2xl flex items-center justify-between text-left group hover:border-pink-500/40 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Promo Coupons</h4>
                  <p className="text-xs text-slate-400">Discounts & campaigns</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Dual Panel: Recent Orders Quick Operations & Low Stock Inventory Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders Table with 1-Click Status Update */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Incoming Orders & 1-Click Status
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update order progress directly without leaving the dashboard
                  </p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  Full View <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Fulfillment Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {stats.recentOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-indigo-400 font-semibold">
                            #{ord._id.substring(0, 8)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-white font-medium">{ord.user?.name || 'Customer'}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{ord.user?.email || 'N/A'}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">
                            ${Number(ord.totalPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.paymentStatus === 'PAID'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1 border outline-none cursor-pointer transition-colors ${getOrderStatusBadge(
                                ord.orderStatus
                              )}`}
                            >
                              <option value="PENDING" className="bg-slate-900 text-amber-400">PENDING</option>
                              <option value="PROCESSING" className="bg-slate-900 text-blue-400">PROCESSING</option>
                              <option value="SHIPPED" className="bg-slate-900 text-indigo-400">SHIPPED</option>
                              <option value="DELIVERED" className="bg-slate-900 text-emerald-400">DELIVERED</option>
                              <option value="CANCELLED" className="bg-slate-900 text-rose-400">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No orders recorded yet. Place an order or run seed.
                </div>
              )}
            </div>

            {/* Low-Stock Inventory Alert & Instant Restock */}
            <div className="glass-card p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      Low Stock Alerts
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Products with less than 10 units in stock</p>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-full">
                    {stats?.lowStockProducts || 0} Critical
                  </span>
                </div>

                {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {stats.lowStockItems.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.images?.[0]?.secure_url ||
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop'
                            }
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                          />
                          <div>
                            <p className="text-xs font-medium text-white truncate max-w-[130px]">{item.name}</p>
                            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              Only {item.stock} left
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleQuickRestock(item._id, item.stock, item.name, 15)}
                          className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold rounded-lg border border-indigo-500/30 transition-all whitespace-nowrap"
                        >
                          +15 Restock
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    All products have healthy inventory levels (&gt;= 10 units).
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Need to create new items?</span>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Quick Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Customer & Administrator Accounts
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage roles, toggle account security suspensions, and control access permissions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer Only</option>
                <option value="admin">Admin Only</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No users match your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Account Status</th>
                    <th className="px-5 py-3.5">Joined Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.isBlocked
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {u.isBlocked ? 'SUSPENDED / BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserRole(u._id, u.role, u.name)}
                            title={u.role === 'admin' ? 'Demote to customer' : 'Promote to admin'}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                          </button>

                          <button
                            onClick={() => handleToggleBlockUser(u._id, u.isBlocked, u.name)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              u.isBlocked
                                ? 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30'
                                : 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COUPONS & DISCOUNTS */}
      {activeTab === 'coupons' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-400" />
                Coupon Promotions & Discounts
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create checkout discount vouchers, manage active promotions, and set minimum purchase thresholds.
              </p>
            </div>

            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Coupon
            </button>
          </div>

          {loadingCoupons ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-pink-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No coupons created yet. Click "Create Coupon" to launch your first promotional discount.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiresAt) < new Date();
                return (
                  <div
                    key={coupon._id}
                    className={`p-5 rounded-2xl border transition-all ${
                      coupon.isActive && !isExpired
                        ? 'bg-slate-900/60 border-slate-700 hover:border-pink-500/40'
                        : 'bg-slate-900/30 border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-pink-400 tracking-wider bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                          {coupon.code}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          coupon.isActive && !isExpired
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isExpired
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isExpired ? 'EXPIRED' : coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <p className="font-semibold text-white text-sm">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `$${coupon.discountValue} FLAT DISCOUNT`}
                      </p>
                      <p className="text-slate-400">
                        Min. Purchase: <span className="text-slate-200">${coupon.minimumPurchase || 0}</span>
                      </p>
                      <p className="text-slate-400">
                        Expires: <span className="text-slate-200">{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      </p>
                      <p className="text-slate-400">
                        Usage: <span className="text-slate-200">{coupon.usedCount || 0} times</span>
                        {coupon.usageLimit ? ` (Max ${coupon.usageLimit})` : ''}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleCouponActive(coupon._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          coupon.isActive
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QUICK PRODUCT CREATION MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Quick Add Product</h3>
            <p className="text-xs text-slate-400 mb-6">Instantly publish a new item into the store catalog</p>

            <form onSubmit={handleCreateQuickProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={quickProduct.name}
                  onChange={(e) => setQuickProduct({ ...quickProduct, name: e.target.value })}
                  placeholder="e.g. Apex Ultra Wireless Headphones"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={quickProduct.category}
                    onChange={(e) => setQuickProduct({ ...quickProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={quickProduct.brand}
                    onChange={(e) => setQuickProduct({ ...quickProduct, brand: e.target.value })}
                    placeholder="ShopSphere"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quickProduct.price}
                    onChange={(e) => setQuickProduct({ ...quickProduct, price: e.target.value })}
                    placeholder="129.99"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={quickProduct.stock}
                    onChange={(e) => setQuickProduct({ ...quickProduct, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={quickProduct.imageUrl}
                  onChange={(e) => setQuickProduct({ ...quickProduct, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  value={quickProduct.description}
                  onChange={(e) => setQuickProduct({ ...quickProduct, description: e.target.value })}
                  placeholder="Short marketing description..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={quickProduct.isFeatured}
                  onChange={(e) => setQuickProduct({ ...quickProduct, isFeatured: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featuredCheck" className="text-slate-300 text-xs cursor-pointer">
                  Featured Product (Showcase on Homepage)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  {submittingProduct && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Create Discount Coupon</h3>
            <p className="text-xs text-slate-400 mb-6">Launch a promotional voucher code for customers</p>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FLASH25"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase font-mono font-bold focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Type *</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    placeholder={newCoupon.discountType === 'percentage' ? '20 (%)' : '15 ($)'}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min. Purchase ($)</label>
                  <input
                    type="number"
                    value={newCoupon.minimumPurchase}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minimumPurchase: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    placeholder="Unlimited (leave empty)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expiration Date *</label>
                <input
                  type="date"
                  required
                  value={newCoupon.expiresAt}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
