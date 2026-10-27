import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorizeRoles('admin'), upload.single('image'), createCategory);
router.put('/:id', protect, authorizeRoles('admin'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

export default router;
