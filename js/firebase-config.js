// Firebase Configuration for Spec Interior
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, onSnapshot, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBX6_vugEivp8Y2h-DZw9L2-lxxyaR4U8c",
  authDomain: "spec-interior.firebaseapp.com",
  projectId: "spec-interior",
  storageBucket: "spec-interior.firebasestorage.app",
  messagingSenderId: "728493087913",
  appId: "1:728493087913:web:c55274007e4fa807c15db8",
  measurementId: "G-B4KDV0KHQN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = "dnil3dadp";
const CLOUDINARY_UPLOAD_PRESET = "spec-interior-store";

// Razorpay config
const RAZORPAY_KEY_ID = "rzp_test_SphB04wind6znp";

// EmailJS config
const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_ORDER_TEMPLATE_ID = "YOUR_EMAILJS_ORDER_TEMPLATE_ID";
const EMAILJS_ADMIN_TEMPLATE_ID = "YOUR_EMAILJS_ADMIN_TEMPLATE_ID";

// Coupon codes (fallback — primary validation is from Firestore 'coupons' collection)
const COUPON_CODES = {};

export {
  db, auth, app,
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, where, onSnapshot, getDoc, setDoc,
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup,
  CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, RAZORPAY_KEY_ID,
  EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_ORDER_TEMPLATE_ID, EMAILJS_ADMIN_TEMPLATE_ID,
  COUPON_CODES
};
