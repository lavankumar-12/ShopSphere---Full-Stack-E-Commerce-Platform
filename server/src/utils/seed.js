import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.model.js';
import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { Coupon } from '../models/coupon.model.js';
import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { Wishlist } from '../models/wishlist.model.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for complete seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Coupon.deleteMany(),
      Order.deleteMany(),
      Cart.deleteMany(),
      Wishlist.deleteMany(),
    ]);

    logger.info('Existing collections cleared.');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@shopsphere.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      addresses: [
        {
          street: '100 Tech Park Blvd',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'United States',
          isDefault: true,
        },
      ],
    });

    const testCustomer = await User.create({
      name: 'Test Customer',
      email: 'customer@shopsphere.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 789-0123',
      addresses: [
        {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
          isDefault: true,
        },
      ],
    });

    const lavanUser = await User.create({
      name: 'Lavan Kumar',
      email: 'lavannani16@gmail.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 321-6549',
      addresses: [
        {
          street: '456 Innovation Way',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'United States',
          isDefault: true,
        },
      ],
    });

    logger.info('Users seeded.');

    // 2. Seed Categories
    const categoriesData = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Next-gen audio, smart wearables, monitors, and modern productivity gear.',
        image: {
          public_id: 'seed-cat-electronics',
          secure_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
        },
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Contemporary streetwear, minimalist tailoring, and premium everyday apparel.',
        image: {
          public_id: 'seed-cat-fashion',
          secure_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
        },
      },
      {
        name: 'Home & Living',
        slug: 'home',
        description: 'Designer lighting, acoustic ambiance, ergonomic accessories, and luxury home accents.',
        image: {
          public_id: 'seed-cat-home',
          secure_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
        },
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Handcrafted leather goods, titanium watches, premium carry-ons, and eyewear.',
        image: {
          public_id: 'seed-cat-accessories',
          secure_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
        },
      },
      {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Performance trainers, artisanal boots, and sleek urban sneakers engineered for comfort.',
        image: {
          public_id: 'seed-cat-footwear',
          secure_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
        },
      },
    ];

    const seededCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    seededCategories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    logger.info('Categories seeded.');

    // 3. Seed Products
    const productsData = [
      {
        name: 'Aether Pro Noise-Cancelling Headphones',
        description: 'Flagship studio-grade wireless headphones featuring bespoke 40mm titanium drivers, ultra-low latency spatial audio, and 45-hour continuous battery life with quick charge.',
        price: 349.99,
        discountPrice: 299.99,
        category: catMap['electronics'],
        brand: 'Aether Audio',
        stock: 35,
        ratings: 4.9,
        numReviews: 128,
        isFeatured: true,
        images: [
          {
            public_id: 'prod-headphone-1',
            secure_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
          },
          {
            public_id: 'prod-headphone-2',
            secure_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Battery Life', value: '45 Hours' },
          { key: 'Noise Cancellation', value: 'Active Hybrid ANC' },
          { key: 'Weight', value: '254g' },
          { key: 'Connectivity', value: 'Bluetooth 5.3 & 3.5mm Jack' },
        ],
      },
      {
        name: 'Chronos Horizon Titanium Smartwatch',
        description: 'Aerospace-grade Grade 5 titanium chassis, sapphire crystal display, continuous ECG and oxygen biometric sensors, paired with a water resistance rating up to 100 meters.',
        price: 499.00,
        discountPrice: 429.00,
        category: catMap['accessories'],
        brand: 'Chronos',
        stock: 18,
        ratings: 4.8,
        numReviews: 94,
        isFeatured: true,
        images: [
          {
            public_id: 'prod-watch-1',
            secure_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Case Material', value: 'Grade 5 Titanium' },
          { key: 'Water Resistance', value: '10 ATM (100m)' },
          { key: 'Display', value: '1.43" AMOLED Sapphire' },
        ],
      },
      {
        name: 'Apex Studio Mechanical Keyboard',
        description: 'Custom hot-swappable tactile switches, gasket mounted CNC milled aluminum body with sound-dampening brass weight and programmable RGB per-key backlighting.',
        price: 189.99,
        category: catMap['electronics'],
        brand: 'Apex Tech',
        stock: 42,
        ratings: 4.7,
        numReviews: 63,
        isFeatured: true,
        images: [
          {
            public_id: 'prod-keyboard-1',
            secure_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Switches', value: 'Gateron Oil King (Lubed)' },
          { key: 'Layout', value: '75% Compact ANSI' },
          { key: 'Connection', value: 'Tri-mode 2.4G / BT / Type-C' },
        ],
      },
      {
        name: 'Nomad Waxed Canvas Weekender Duffle',
        description: 'Weatherproof British Millerain waxed canvas trimmed with vegetable-tanned Italian leather. Reinforced brass hardware and dedicated padded 16" laptop sleeve.',
        price: 245.00,
        discountPrice: 195.00,
        category: catMap['accessories'],
        brand: 'Nomad Heritage',
        stock: 22,
        ratings: 4.9,
        numReviews: 51,
        isFeatured: true,
        images: [
          {
            public_id: 'prod-bag-1',
            secure_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Capacity', value: '42 Liters' },
          { key: 'Material', value: '18oz Waxed Cotton & Full-Grain Leather' },
        ],
      },
      {
        name: 'Velocity Surge Carbon-Plated Runners',
        description: 'Ultra-lightweight supercritical nitrogen foam midsole embedded with full-length carbon fiber propulsion plate designed for record-setting marathon pace and unmatched rebound.',
        price: 220.00,
        discountPrice: 185.00,
        category: catMap['footwear'],
        brand: 'Velocity Lab',
        stock: 14,
        ratings: 4.8,
        numReviews: 76,
        isFeatured: true,
        images: [
          {
            public_id: 'prod-shoes-1',
            secure_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Drop', value: '8mm' },
          { key: 'Weight', value: '198g (Size 9)' },
          { key: 'Plate', value: 'Full-Length 3K Carbon Fiber' },
        ],
      },
      {
        name: 'Minimalist Merino Wool Overcoat',
        description: '100% fine Australian merino wool double-faced fabric with relaxed shoulder drop, horn buttons, deep interior welt pockets, and refined breathable cupro lining.',
        price: 380.00,
        category: catMap['fashion'],
        brand: 'Atelier Minimal',
        stock: 9, // low stock test
        ratings: 4.6,
        numReviews: 34,
        isFeatured: false,
        images: [
          {
            public_id: 'prod-coat-1',
            secure_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Fabric', value: '100% Extra-Fine Merino Wool' },
          { key: 'Fit', value: 'Tailored Relaxed Fit' },
        ],
      },
      {
        name: 'Lumina Sculptural Ambient Desk Lamp',
        description: 'Precision milled solid walnut base and matte spun brass diffuser offering circadian warmth tuning (1800K - 4000K) and touch capacitive stepless dimming.',
        price: 155.00,
        discountPrice: 129.00,
        category: catMap['home'],
        brand: 'Lumina Design',
        stock: 28,
        ratings: 4.9,
        numReviews: 42,
        isFeatured: true,
        images: [
          {
            public_id: 'prod-lamp-1',
            secure_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Color Temperature', value: '1800K - 4000K Stepless' },
          { key: 'CRI Rating', value: '98+ (True Color)' },
        ],
      },
      {
        name: 'Acoustic SoundScape Wireless Home Speaker',
        description: '360-degree omnidirectional acoustic array featuring twin opposing subwoofers, room calibration microphones, Apple AirPlay 2, Spotify Connect, and Wi-Fi streaming.',
        price: 299.00,
        category: catMap['electronics'],
        brand: 'Aether Audio',
        stock: 19,
        ratings: 4.7,
        numReviews: 58,
        isFeatured: false,
        images: [
          {
            public_id: 'prod-speaker-1',
            secure_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Amplification', value: '120W Class-D Peak' },
          { key: 'Wireless', value: 'Wi-Fi 6, Bluetooth 5.3, AirPlay 2' },
        ],
      },
      {
        name: 'Komorebi Japanese Ceramic Pour-Over Set',
        description: 'Hand-thrown Hasami porcelain dripper accompanied by an 800ml heat-resistant borosilicate glass carafe and laser-etched stainless steel precision mesh.',
        price: 78.00,
        discountPrice: 65.00,
        category: catMap['home'],
        brand: 'Hasami Craft',
        stock: 31,
        ratings: 4.8,
        numReviews: 89,
        isFeatured: false,
        images: [
          {
            public_id: 'prod-coffee-1',
            secure_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Carafe Volume', value: '800ml' },
          { key: 'Material', value: 'Hasami Sandstone Clay & Glass' },
        ],
      },
      {
        name: 'Elysian Polarized Acetate Sunglasses',
        description: 'Handcrafted Italian Mazzucchelli acetate frames paired with anti-reflective Carl Zeiss polarized lenses with 100% UVA/UVB ultraviolet defense.',
        price: 165.00,
        category: catMap['accessories'],
        brand: 'Elysian Optics',
        stock: 25,
        ratings: 4.6,
        numReviews: 38,
        isFeatured: false,
        images: [
          {
            public_id: 'prod-sunglasses-1',
            secure_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Lenses', value: 'Zeiss Polarized Polycarbonate' },
          { key: 'Frame', value: 'Mazzucchelli Bio-Acetate' },
        ],
      },
      {
        name: 'Urban Transit Heavyweight Organic Hoodie',
        description: 'Crafted from 500 GSM unbrushed organic French terry cotton with flatlock stitching, pre-shrunk ribbed side gussets, and structured double-layer hood.',
        price: 110.00,
        discountPrice: 95.00,
        category: catMap['fashion'],
        brand: 'Atelier Minimal',
        stock: 6, // low stock test
        ratings: 4.9,
        numReviews: 112,
        isFeatured: false,
        images: [
          {
            public_id: 'prod-hoodie-1',
            secure_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Weight', value: '500 GSM Heavyweight' },
          { key: 'Fabric', value: '100% GOTS Certified Organic Cotton' },
        ],
      },
      {
        name: 'Terraform Minimalist Leather High-Tops',
        description: 'Supple Italian calfskin leather upper, Margom stitched rubber cup sole, and antimicrobial memory foam insole engineered for all-day city roaming.',
        price: 215.00,
        category: catMap['footwear'],
        brand: 'Velocity Lab',
        stock: 16,
        ratings: 4.7,
        numReviews: 47,
        isFeatured: false,
        images: [
          {
            public_id: 'prod-boots-1',
            secure_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop',
          },
        ],
        specifications: [
          { key: 'Upper', value: 'Full-Grain Italian Calfskin' },
          { key: 'Sole', value: 'Margom Stitched Italian Rubber' },
        ],
      },
    ];

    const seededProducts = [];
    for (const p of productsData) {
      p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);
      const createdProd = await Product.create(p);
      seededProducts.push(createdProd);
    }
    logger.info(`Seeded ${seededProducts.length} products.`);

    // 4. Seed Coupons
    const couponsData = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minimumPurchase: 50,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        usageLimit: 1000,
        usedCount: 12,
        isActive: true,
      },
      {
        code: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        minimumPurchase: 100,
        maximumDiscount: 60,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        usageLimit: 500,
        usedCount: 25,
        isActive: true,
      },
      {
        code: 'FLAT50',
        discountType: 'fixed',
        discountValue: 50,
        minimumPurchase: 200,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        usageLimit: 200,
        usedCount: 5,
        isActive: true,
      },
    ];

    await Coupon.insertMany(couponsData);
    logger.info('Coupons seeded.');

    // 5. Seed Sample Orders for Customer & Dashboard Analytics
    const sampleProduct1 = seededProducts[0];
    const sampleProduct2 = seededProducts[1];
    const sampleProduct3 = seededProducts[3];

    const sampleOrders = [
      {
        user: testCustomer._id,
        orderItems: [
          {
            name: sampleProduct1.name,
            quantity: 1,
            price: sampleProduct1.discountPrice || sampleProduct1.price,
            image: sampleProduct1.images[0].secure_url,
            product: sampleProduct1._id,
          },
          {
            name: sampleProduct2.name,
            quantity: 1,
            price: sampleProduct2.discountPrice || sampleProduct2.price,
            image: sampleProduct2.images[0].secure_url,
            product: sampleProduct2._id,
          },
        ],
        shippingAddress: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
        },
        paymentMethod: 'Stripe',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        itemsPrice: (sampleProduct1.discountPrice || sampleProduct1.price) + (sampleProduct2.discountPrice || sampleProduct2.price),
        taxPrice: 36.45,
        shippingPrice: 0,
        discountPrice: 30.00,
        totalPrice: 735.44,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user: testCustomer._id,
        orderItems: [
          {
            name: sampleProduct3.name,
            quantity: 1,
            price: sampleProduct3.discountPrice || sampleProduct3.price,
            image: sampleProduct3.images[0].secure_url,
            product: sampleProduct3._id,
          },
        ],
        shippingAddress: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
        },
        paymentMethod: 'Demo Card',
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        itemsPrice: sampleProduct3.discountPrice || sampleProduct3.price,
        taxPrice: 9.75,
        shippingPrice: 0,
        discountPrice: 0,
        totalPrice: 204.75,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    await Order.insertMany(sampleOrders);
    logger.info('Sample orders seeded.');

    // 6. Seed Cart & Wishlist for customer
    await Cart.create({
      user: testCustomer._id,
      items: [
        {
          product: seededProducts[2]._id,
          quantity: 1,
          price: seededProducts[2].price,
        },
      ],
      totalPrice: seededProducts[2].price,
    });

    await Wishlist.create({
      user: testCustomer._id,
      products: [seededProducts[0]._id, seededProducts[1]._id],
    });

    logger.info('All ShopSphere data seeded with 100% completeness!');
    process.exit(0);
  } catch (error) {
    logger.error(`Error with complete seeding: ${error.stack || error}`);
    process.exit(1);
  }
};

seedDatabase();
