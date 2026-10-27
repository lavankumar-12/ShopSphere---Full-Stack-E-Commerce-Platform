import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProductImage } from '../controllers/product.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', protect, authorizeRoles('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorizeRoles('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorizeRoles('admin'), deleteProduct);
router.delete('/:productId/images/:imageId', protect, authorizeRoles('admin'), deleteProductImage);

export default router;
