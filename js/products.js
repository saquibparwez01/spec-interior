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
 * Extract the base Firestore product ID from a cart item ID.
 * Size variant items have IDs like "abc12345678901234567-size0",
 * but the Firestore doc ID is just "abc12345678901234567".
 * Firestore IDs are 20-char alphanumeric, so we split on first '-' after 20 chars.
 */
function getBaseProductId(cartItemId) {
  // Firestore auto-IDs are exactly 20 characters
  if (cartItemId && cartItemId.length > 20 && cartItemId[20] === '-') {
    return cartItemId.substring(0, 20);
  }
  return cartItemId;
}

/**
 * Get the size variant index from a cart item ID (-1 if no variant / default)
 * Format: productId-size0, productId-size1, etc.
 * Also handles legacy format: productId-labeltext
 */
function getSizeVariantIndex(cartItemId) {
  if (cartItemId && cartItemId.length > 20 && cartItemId[20] === '-') {
    const suffix = cartItemId.substring(21);
    // New format: size0, size1, size2...
    const match = suffix.match(/^size(\d+)$/);
    if (match) return parseInt(match[1]);
    // Legacy format: alphanumeric label text — return -1 (will use base price)
    return -1;
  }
  return -1;
}

/**
 * Check stock availability for cart items
 * @returns {Object} { valid: boolean, outOfStock: [items] }
 */
export async function checkStock(cartItems) {
  const outOfStock = [];
  for (const item of cartItems) {
    const baseId = getBaseProductId(item.id);
    const ref = doc(db, PRODUCTS_COLLECTION, baseId);
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
    const baseId = getBaseProductId(item.id);
    const ref = doc(db, PRODUCTS_COLLECTION, baseId);
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
 * Returns cart with verified prices from database.
 * Handles size variant items by looking up the correct variant price.
 */
export async function verifyCartPrices(cartItems) {
  const verifiedCart = [];
  for (const item of cartItems) {
    const baseId = getBaseProductId(item.id);
    const sizeIdx = getSizeVariantIndex(item.id);
    const ref = doc(db, PRODUCTS_COLLECTION, baseId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const product = snap.data();
      let verifiedPrice = product.price;
      let verifiedName = item.name || product.name;

      // If this is a size variant with valid index, get price from sizes array
      if (sizeIdx >= 0 && product.sizes && product.sizes[sizeIdx]) {
        verifiedPrice = product.sizes[sizeIdx].price;
      }
      // For default size or legacy format, use base product price

      verifiedCart.push({
        ...item,
        price: verifiedPrice,
        name: verifiedName
      });
    } else {
      // Try full ID as document ID (non-variant product)
      const directRef = doc(db, PRODUCTS_COLLECTION, item.id);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const product = directSnap.data();
        verifiedCart.push({
          ...item,
          price: product.price,
          name: item.name || product.name
        });
      } else {
        throw new Error(`Product "${item.name}" is no longer available`);
      }
    }
  }
  return verifiedCart;
}
