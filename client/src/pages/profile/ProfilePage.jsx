import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Heart, ShoppingBag, ShieldCheck, Plus, Check, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';
import { setCredentials } from '../../store/slices/authSlice.js';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { products: wishlistItems } = useSelector((state) => state.wishlist);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  // New Address State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.put('/auth/me', { name, phone });
      dispatch(setCredentials({ user: res.data.data.user, token }));
      toast.success('Profile details updated!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    try {
      const currentAddresses = user?.addresses || [];
      const newAddress = {
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: currentAddresses.length === 0,
      };

      const res = await api.put('/auth/me', {
        addresses: [...currentAddresses, newAddress],
      });

      dispatch(setCredentials({ user: res.data.data.user, token }));
      toast.success('Address added successfully!');
      setShowAddressModal(false);
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      const updated = (user?.addresses || []).map((addr, idx) => ({
        ...addr,
        isDefault: idx === index,
      }));
      const res = await api.put('/auth/me', { addresses: updated });
      dispatch(setCredentials({ user: res.data.data.user, token }));
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const filtered = (user?.addresses || []).filter((_, idx) => idx !== index);
      const res = await api.put('/auth/me', { addresses: filtered });
      dispatch(setCredentials({ user: res.data.data.user, token }));
      toast.success('Address removed');
    } catch (error) {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-white">My Account</h1>
        <p className="text-slate-400 mt-1">Manage your personal profile, addresses, and view order activity</p>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Link
          to="/orders"
          className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-colors group"
        >
          <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">Order History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track & review shipments</p>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-colors group"
        >
          <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-pink-400 transition-colors">Saved Wishlist</h3>
            <p className="text-xs text-slate-400 mt-0.5">{wishlistItems.length} items saved</p>
          </div>
        </Link>

        <Link
          to="/cart"
          className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-colors group"
        >
          <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">Active Cart</h3>
            <p className="text-xs text-slate-400 mt-0.5">{cartItems.length} items in cart</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/25">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-xs text-slate-400">{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Administrator
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Your name"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/20 border border-slate-800 rounded-xl text-slate-400 text-sm cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 ml-1">Email address cannot be modified</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="+1 (555) 000-0000"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Shipping Addresses</h2>
                  <p className="text-xs text-slate-400">Manage addresses for fast one-click checkout</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {(!user?.addresses || user.addresses.length === 0) ? (
              <div className="py-12 text-center text-slate-500">
                <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>No saved addresses found. Add one for quick checkout!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      addr.isDefault
                        ? 'bg-slate-900/80 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      {addr.isDefault ? (
                        <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Default Address
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultAddress(idx)}
                          className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                          Set as default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-white mb-1">{addr.street}</p>
                    <p className="text-xs text-slate-400">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{addr.country}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Add New Shipping Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="123 Ocean Blvd"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Miami"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="FL"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="33101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="United States"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
