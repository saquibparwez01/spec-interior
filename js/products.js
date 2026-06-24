// Products Module — Firebase CRUD
import {
  db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, getDoc
} from './firebase-config.js';

const PRODUCTS_COLLECTION = 'products';

/**
 * Add a new product to Firestore
 */
export async function addProduct(product) {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    stock: product.stock ?? 99,
    createdAt: new Date().toISOString()
  });
  return { id: docRef.id, ...product };
}

/**
 * Get all products from Firestore
 */
export async function getProducts() {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Update a product in Firestore
 */
export async function updateProduct(id, data) {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

/**
 * Delete a product from Firestore
 */
export async function deleteProduct(id) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}

/**
 * Listen to real-time product changes
 */
export function onProductsChange(callback) {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(products);
  });
}

/**
 * Check stock availability for cart items
 * @returns {Object} { valid: boolean, outOfStock: [items] }
 */
export async function checkStock(cartItems) {
  const outOfStock = [];
  for (const item of cartItems) {
    const ref = doc(db, PRODUCTS_COLLECTION, item.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const product = snap.data();
      const stock = product.stock ?? 99;
      if (item.qty > stock) {
        outOfStock.push({ ...item, available: stock });
      }
    }
  }
  return { valid: outOfStock.length === 0, outOfStock };
}

/**
 * Reduce stock after successful order
 */
export async function reduceStock(cartItems) {
  for (const item of cartItems) {
    const ref = doc(db, PRODUCTS_COLLECTION, item.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const product = snap.data();
      const currentStock = product.stock ?? 99;
      const newStock = Math.max(0, currentStock - item.qty);
      await updateDoc(ref, { stock: newStock, updatedAt: new Date().toISOString() });
    }
  }
}

/**
 * Verify cart prices against Firestore (prevents price manipulation)
 * Returns cart with verified prices from database
 */
export async function verifyCartPrices(cartItems) {
  const verifiedCart = [];
  for (const item of cartItems) {
    const ref = doc(db, PRODUCTS_COLLECTION, item.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const product = snap.data();
      verifiedCart.push({
        ...item,
        price: product.price, // Use REAL price from database, not localStorage
        name: product.name    // Use real name too
      });
    } else {
      // Product doesn't exist in database — reject
      throw new Error(`Product "${item.name}" is no longer available`);
    }
  }
  return verifiedCart;
}
