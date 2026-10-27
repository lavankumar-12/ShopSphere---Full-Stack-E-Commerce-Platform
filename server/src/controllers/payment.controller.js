import stripe from '../config/stripe.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id;

    try {
      const order = await Order.findById(orderId).populate('user', 'email name');
      
      if (order && order.paymentStatus !== 'PAID') {
        order.paymentStatus = 'PAID';
        order.orderStatus = 'PROCESSING';
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();

        // Deduct inventory
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }

        // Send Email
        await sendOrderConfirmationEmail(order.user.email, order);
      }
    } catch (error) {
      logger.error('Error handling checkout session completed event:', error);
    }
  }

  res.json({ received: true });
};
