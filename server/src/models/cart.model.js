import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  }
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

// Auto-calculate total price before save
cartSchema.pre('save', function(next) {
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

export const Cart = mongoose.model('Cart', cartSchema);
