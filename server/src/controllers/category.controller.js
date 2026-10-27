import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/fileUpload.js';
import logger from '../utils/logger.js';

export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.status(200).json(new ApiResponse(200, categories));
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, imageUrl } = req.body;
  
  if (!name) return next(new ApiError(400, 'Category name is required'));

  let imageData = {};
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'shopsphere/categories');
      imageData = { public_id: result.public_id, secure_url: result.secure_url };
    } catch (err) {
      logger.error(`Cloudinary category upload failed: ${err.message}`);
    }
  }

  if (!imageData.secure_url && imageUrl) {
    imageData = { public_id: `url-${Date.now()}`, secure_url: imageUrl };
  }

  const category = await Category.create({ name, description, image: imageData });
  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ApiError(404, 'Category not found'));

  const { name, description, isActive, imageUrl } = req.body;
  if (name) category.name = name;
  if (description) category.description = description;
  if (isActive !== undefined) category.isActive = isActive === true || isActive === 'true';

  if (imageUrl) {
    category.image = { public_id: `url-${Date.now()}`, secure_url: imageUrl };
  }

  if (req.file) {
    if (category.image?.public_id && !category.image.public_id.startsWith('url-')) {
      await deleteFromCloudinary(category.image.public_id).catch(() => {});
    }
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'shopsphere/categories');
      category.image = { public_id: result.public_id, secure_url: result.secure_url };
    } catch (err) {
      logger.error(`Cloudinary upload failed: ${err.message}`);
    }
  }

  await category.save();
  res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ApiError(404, 'Category not found'));

  const associatedProducts = await Product.countDocuments({ category: req.params.id });
  if (associatedProducts > 0) {
    return next(new ApiError(400, `Cannot delete category: ${associatedProducts} products belong to this category`));
  }

  if (category.image?.public_id && !category.image.public_id.startsWith('url-')) {
    await deleteFromCloudinary(category.image.public_id).catch(() => {});
  }

  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});
