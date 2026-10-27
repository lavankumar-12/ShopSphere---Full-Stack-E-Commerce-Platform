import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/fileUpload.js';
import logger from '../utils/logger.js';

export const getProducts = asyncHandler(async (req, res, next) => {
  let { search, category, brand, minPrice, maxPrice, rating, sort, page, limit, featured } = req.query;

  // Build Query
  const queryObj = { isActive: true };

  // Resilient text search (regex match across name, description, brand)
  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };
    queryObj.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { brand: searchRegex }
    ];
  }

  // Category or Featured filter
  if (category === 'featured' || featured === 'true') {
    queryObj.isFeatured = true;
  } else if (category && category !== 'all') {
    const categoryDoc = await Category.findOne({
      $or: [{ slug: category }, { name: { $regex: new RegExp('^' + category + '$', 'i') } }]
    });
    if (categoryDoc) {
      queryObj.category = categoryDoc._id;
    } else {
      queryObj.category = null;
    }
  }

  if (brand) queryObj.brand = { $regex: brand, $options: 'i' };
  
  if (minPrice || maxPrice) {
    queryObj.price = {};
    if (minPrice) queryObj.price.$gte = Number(minPrice);
    if (maxPrice) queryObj.price.$lte = Number(maxPrice);
  }

  if (rating) queryObj.ratings = { $gte: Number(rating) };

  let query = Product.find(queryObj).populate('category', 'name slug');

  // Sorting
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  page = Number(page) || 1;
  limit = Number(limit) || 12;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const [products, total] = await Promise.all([
    query,
    Product.countDocuments(queryObj)
  ]);

  res.status(200).json(new ApiResponse(200, {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }));
});

export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) return next(new ApiError(404, 'Product not found'));
  res.status(200).json(new ApiResponse(200, product));
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, discountPrice, category, brand, stock, specifications, imageUrl, images: bodyImages, isFeatured } = req.body;

  let images = [];

  // 1. Files uploaded via Multer
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.buffer, 'shopsphere/products');
        images.push({ public_id: result.public_id, secure_url: result.secure_url });
      } catch (err) {
        logger.error(`Cloudinary upload failed: ${err.message}`);
      }
    }
  }

  // 2. Direct single image URL string
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
    images.push({ public_id: `url-${Date.now()}`, secure_url: imageUrl.trim() });
  }

  // 3. Array of image URLs or image objects
  if (Array.isArray(bodyImages)) {
    bodyImages.forEach((img, i) => {
      if (typeof img === 'string' && img.trim()) {
        images.push({ public_id: `url-${Date.now()}-${i}`, secure_url: img.trim() });
      } else if (img && img.secure_url) {
        images.push({ public_id: img.public_id || `url-${Date.now()}-${i}`, secure_url: img.secure_url });
      }
    });
  }

  // 4. Default fallback image if none provided
  if (images.length === 0) {
    images.push({
      public_id: 'default-product',
      secure_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'
    });
  }

  // Parse specifications
  let parsedSpecs = [];
  if (specifications) {
    try {
      parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    } catch {
      parsedSpecs = [];
    }
  }

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    category,
    brand: brand || 'ShopSphere',
    stock: stock !== undefined ? Number(stock) : 10,
    images,
    specifications: parsedSpecs,
    isFeatured: isFeatured === true || isFeatured === 'true',
  });

  const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
  res.status(201).json(new ApiResponse(201, populatedProduct, 'Product created successfully'));
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ApiError(404, 'Product not found'));

  const fields = ['name', 'description', 'price', 'discountPrice', 'category', 'brand', 'stock', 'isActive', 'isFeatured'];
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'price' || field === 'discountPrice' || field === 'stock') {
        product[field] = Number(req.body[field]);
      } else if (field === 'isFeatured' || field === 'isActive') {
        product[field] = req.body[field] === true || req.body[field] === 'true';
      } else {
        product[field] = req.body[field];
      }
    }
  });

  if (req.body.specifications) {
    try {
      product.specifications = typeof req.body.specifications === 'string'
        ? JSON.parse(req.body.specifications)
        : req.body.specifications;
    } catch {
      // keep existing if invalid
    }
  }

  // Direct image URL update
  if (req.body.imageUrl && typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim()) {
    product.images = [{ public_id: `url-${Date.now()}`, secure_url: req.body.imageUrl.trim() }];
  }

  // Append any uploaded files
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.buffer, 'shopsphere/products');
        product.images.push({ public_id: result.public_id, secure_url: result.secure_url });
      } catch (err) {
        logger.error(`Cloudinary upload failed: ${err.message}`);
      }
    }
  }

  await product.save();
  const updatedProduct = await Product.findById(product._id).populate('category', 'name slug');
  res.status(200).json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ApiError(404, 'Product not found'));

  // Attempt to delete cloudinary images if real public_id exists
  for (const img of product.images) {
    if (img.public_id && !img.public_id.startsWith('url-') && img.public_id !== 'default-product' && !img.public_id.startsWith('seed-')) {
      await deleteFromCloudinary(img.public_id).catch(() => {});
    }
  }

  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const { productId, imageId } = req.params;
  const product = await Product.findById(productId);
  
  if (!product) return next(new ApiError(404, 'Product not found'));

  const image = product.images.find(img => img._id.toString() === imageId);
  if (!image) return next(new ApiError(404, 'Image not found'));

  if (image.public_id && !image.public_id.startsWith('url-') && image.public_id !== 'default-product') {
    await deleteFromCloudinary(image.public_id).catch(() => {});
  }
  product.images = product.images.filter(img => img._id.toString() !== imageId);
  await product.save();

  res.status(200).json(new ApiResponse(200, product, 'Image deleted'));
});
