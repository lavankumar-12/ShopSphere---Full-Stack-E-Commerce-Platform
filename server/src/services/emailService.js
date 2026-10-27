import { Resend } from 'resend';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || 'ShopSphere <noreply@shopsphere.com>';

export const sendWelcomeEmail = async (email, name) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to ShopSphere!',
      html: `<h1>Welcome ${name}!</h1><p>We're thrilled to have you onboard.</p>`,
    });
  } catch (error) {
    logger.error('Resend email error:', error);
  }
};

export const sendOrderConfirmationEmail = async (email, order) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Confirmation #${order._id}`,
      html: `<h1>Thank you for your order!</h1><p>Your order of $${order.totalPrice} is confirmed and currently processing.</p>`,
    });
  } catch (error) {
    logger.error('Resend email error:', error);
  }
};

// Additional templates (Shipping, Password reset, etc.) can be added here
