import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalPrice: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalPrice = action.payload.totalPrice || 0;
      state.isLoading = false;
    },
    clearCartState: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCart, clearCartState, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
