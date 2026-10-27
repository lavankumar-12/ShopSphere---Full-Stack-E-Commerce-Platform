import express from 'express';
import { handleStripeWebhook } from '../controllers/payment.controller.js';

const router = express.Router();

// This route receives raw body for Stripe signature validation. 
// Handled by our middleware configuration in app.js
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
