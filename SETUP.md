# Spec Interior — Setup Guide

## Step 1: Enable Firestore Database

1. Go to https://console.firebase.google.com → select "spec-interior" project
2. Click **Build** → **Firestore Database** in the left sidebar
3. Click **Create database**
4. Choose **Start in test mode** (we'll secure it later)
5. Select a location closest to you (e.g., `asia-south1` for India)
6. Click **Enable**

## Step 2: Enable Authentication (for Admin login — optional for now)

1. In Firebase Console → **Build** → **Authentication**
2. Click **Get started**
3. Enable **Email/Password** sign-in method
4. Add your admin email: saquibparwez18@gmail.com with a password

## Step 3: Deploy to Netlify (Free)

1. Go to https://app.netlify.com
2. Sign up / log in
3. Drag and drop the entire `spec-interior` folder onto the deploy area
4. Your site will be live at a random URL like `random-name.netlify.app`
5. You can set a custom domain later

## Step 4: Set Razorpay to Live Mode (when ready to accept real payments)

1. Go to https://dashboard.razorpay.com
2. Complete KYC verification
3. Go to Settings → API Keys → Generate **Live** Key
4. Replace `rzp_test_...` with your live key in `js/firebase-config.js`

## Project Structure

```
spec-interior/
├── index.html          ← Customer storefront
├── admin.html          ← Admin dashboard
├── checkout.html       ← Checkout page
├── js/
│   ├── firebase-config.js  ← Firebase + Cloudinary + Razorpay config
│   ├── admin-app.js         ← Admin dashboard logic
│   ├── products.js          ← Product CRUD module
│   ├── orders.js            ← Order CRUD module
│   ├── cart.js              ← Shopping cart logic
│   ├── checkout.js          ← Payment & order creation
│   └── cloudinary.js        ← Image upload helper
└── SETUP.md            ← This file
```

## How It Works

- **Products** are stored in Firebase Firestore (persistent, accessible from anywhere)
- **Images** are uploaded to Cloudinary (permanent URLs, fast CDN delivery)
- **Orders** are created when customers checkout (stored in Firestore)
- **Payments** are processed via Razorpay (UPI, Cards, Wallets)
- **Admin** sees real-time updates (orders appear instantly)
- **COD** orders are also supported (no payment required)

## Important Notes

- The site uses ES Modules (`type="module"`) — it must be served via HTTP, not opened as a local file
- Use a local server for testing: `npx serve .` or Python: `python3 -m http.server 8000`
- Firestore is in test mode initially — secure it before going live
