# Digital Productsy - Premium Digital Marketplace

Digital Productsy is a high-end, premium digital marketplace designed for archivists and creators to sell and buy high-quality digital assets. The platform features an ultra-clean "Aesthetic Purple" design system, custom interactive elements, and robust security.

## 🚀 Getting Started

To run the full platform locally, you will need to start both the **Backend** and the **Frontend** servers.

### 1. Prerequisites
- **Node.js**: Installed on your machine.
- **MongoDB**: Make sure your local MongoDB instance is running (`mongodb://localhost:27017/digiexpo`).

### 2. Run the Backend API
1. Open a new terminal and navigate to the `backend` folder.
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
   - The backend will start on: **http://localhost:7001**

### 3. Run the Frontend Marketplace
1. Open a second terminal and navigate to the `frontend` folder.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
   - The frontend will start on: **http://localhost:7002**

---

## 🗺️ Page Guide

### 🛒 The Marketplace
- **Home (`/`)**: Features the "Aesthetic Purple" hero section, curated categories, and featured products.
- **Catalog (`/catalog`)**: A dedicated page to browse all products in a premium 3-column square grid.
- **Product Details (`/product/[id]`)**: Full-screen visuals with an interactive gallery, smart star ratings, and related products.
- **Cart (`/cart`)**: Manage your selections before checkout.
- **Wishlist (`/wishlist`)**: Save your favorite assets for later (uses localStorage for persistence).

### 🛡️ Secure Authentication
- **Login / Signup**: Redesigned minimalist pages with ethereal gradients and pill-shaped branding.
- **2-Step Verification (`/verify-email`)**: All new accounts require a 6-digit OTP sent to the user's email.
- **Password Recovery**: Support for "Forgot Password" and "Reset Password" via secure email OTPs.

### 💳 Checkout & Delivery
- **Secure Checkout (`/checkout`)**: Integrated with **Razorpay**. Supports UPI, Cards, and Netbanking.
- **Simulation Mode**: If API keys are missing, the system allows you to skip the popup for easy localhost testing.
- **Order Success (`/order-success`)**: Beautiful success animation followed by an **Instant Auto-Download** of your purchased asset.

### 📊 User Experience
- **User Dashboard (`/dashboard`)**: The "Archive Hub" where users track:
  - **My Orders**: Real-time list of purchases.
  - **Download Purchased**: Instant links to your digital inventory.
  - **Payment History**: Transparent audit trail of all transactions.
  - **Recently Viewed**: Dynamically tracks your browsing history.
  - **Profile Management**: Update your archivist identity.
- **Custom Cursor**: A global, smooth-following trailing halo effect for a premium interactive feel.

---

## 🔑 Environment Variables (.env)

### Backend
Create a `.env` in the `backend/` folder:
```env
PORT=7001
MONGODB_URI=mongodb://localhost:27017/digiexpo
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend
The frontend automatically points to `http://localhost:7001/api`.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 16, Lucide React, CSS Modules.
- **Backend**: Node.js, Express, MongoDB/Mongoose.
- **Payments**: Razorpay Gateway.
- **Mailing**: Nodemailer.
