# ShopSphere - Full-Stack MERN E-Commerce Platform

ShopSphere is a production-style, intermediate-to-hard level full-stack e-commerce platform built with the MERN stack. It features a modern, clean, and highly responsive UI designed with Tailwind CSS, a scalable backend architecture, and integrates with services like Cloudinary, Stripe, and Resend.

## Features

- **Authentication & Authorization**: Secure JWT-based authentication with role-based access (Admin, Customer).
- **Product Management**: Full product catalog with search, filtering, sorting, and pagination.
- **Cart & Wishlist**: Manage shopping cart and wishlist items, synced across sessions.
- **Checkout & Payments**: Secure checkout flow integrated with Stripe.
- **Order Management**: Customers can track orders; admins can manage order statuses.
- **User Dashboard**: Customers can manage their profiles, addresses, and view order history.
- **Admin Dashboard**: Comprehensive admin panel to manage products, categories, users, orders, and view sales analytics.
- **Responsive UI/UX**: Built with modern aesthetics, glassmorphism, and smooth micro-interactions.

## Technology Stack

### Frontend
- React.js (with Vite)
- React Router
- Redux Toolkit
- Tailwind CSS
- Axios
- React Hook Form & Zod
- Lucide React
- React Hot Toast

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT & bcrypt
- Helmet, CORS, Express Rate Limit
- Centralized Error Handling

### External Services
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Payments**: Stripe
- **Emails**: Resend
- **Caching/Rate Limiting (Optional)**: Redis

## Architecture

The project is structured into two main parts:
- `client/`: The React frontend application.
- `server/`: The Express backend API.

The backend follows a clean architecture pattern:
`Routes -> Middleware -> Controllers -> Services -> Models -> MongoDB`

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Environment Variables
Copy the `.env.example` file to `.env` in the root and/or `server` directory and fill in your credentials.

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Development Phases

This project is built in iterative phases:
- **Phase 1**: Project setup & architecture (Current)
- **Phase 2**: Authentication
- **Phase 3**: Products
- **Phase 4**: Cloudinary
- **Phase 5**: Cart & Wishlist
- **Phase 6**: Orders
- **Phase 7**: Stripe
- **Phase 8**: Resend
- **Phase 9**: Admin Dashboard
- **Phase 10**: Redis (Optional)
- **Phase 11**: Testing
- **Phase 12**: Deployment

## License
ISC
