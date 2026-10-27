import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  productDetails: null,
  categories: [],
  featuredProducts: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  },
  filters: {
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: '-createdAt',
  },
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload.products;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.isLoading = false;
    },
    setProductDetails: (state, action) => {
      state.productDetails = action.payload;
      state.isLoading = false;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
    },
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetProductFilters: (state) => {
      state.filters = initialState.filters;
    },
    setProductLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setProductError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setProducts,
  setProductDetails,
  setCategories,
  setFeaturedProducts,
  setProductFilters,
  resetProductFilters,
  setProductLoading,
  setProductError,
} = productSlice.actions;

export default productSlice.reducer;
