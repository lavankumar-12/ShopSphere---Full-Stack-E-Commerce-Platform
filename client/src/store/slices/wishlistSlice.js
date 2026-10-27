import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.products = action.payload || [];
      state.isLoading = false;
    },
    clearWishlistState: (state) => {
      state.products = [];
    },
    setWishlistLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setWishlist, clearWishlistState, setWishlistLoading } = wishlistSlice.actions;
export default wishlistSlice.reducer;
