import Stripe from 'stripe';
import './env.js';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_dev_mode';

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16', // Adjust if needed
});

export default stripe;

