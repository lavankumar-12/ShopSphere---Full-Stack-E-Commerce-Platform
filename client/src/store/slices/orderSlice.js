import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  orderDetails: null,
  currentOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.isLoading = false;
    },
    setOrderDetails: (state, action) => {
      state.orderDetails = action.payload;
      state.isLoading = false;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setOrderLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setOrders, setOrderDetails, setCurrentOrder, setOrderLoading } = orderSlice.actions;
export default orderSlice.reducer;
