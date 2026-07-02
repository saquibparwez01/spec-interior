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
 * Size variant items have IDs like "abc123-12inchDx10inchH",
 * but the Firestore doc ID is just "abc123".
 * Firestore IDs are 20-char alphanumeric, so we split on first '-' after 20 chars.
 */
function getBaseProductId(cartItemId) {
  // Firestore auto-IDs are exactly 20 characters
  if (cartItemId && cartItemId.length > 20 && cartItemId[20] === '-') {
    return cartItemId.substring(0, 20);
  }
  // Also handle IDs that contain a dash (variant suffix)
  // Try looking up the full ID first; if it doesn't exist, strip suffix
  return cartItemId;
}

/**
 * Get the size variant suffix from a cart item ID (empty string if no variant)
 */
function getSizeVariantSuffix(cartItemId) {
  if (cartItemId && cartItemId.length > 20 && cartItemId[20] === '-') {
    return cartItemId.substring(21);
  }
  return '';
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
    const variantSuffix = getSizeVariantSuffix(item.id);
    const ref = doc(db, PRODUCTS_COLLECTION, baseId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const product = snap.data();
      let verifiedPrice = product.price;
      let verifiedName = product.name;

      // If this is a size variant, find the matching variant price
      if (variantSuffix && product.sizes && product.sizes.length > 0) {
        const matchedSize = product.sizes.find(s => 
          s.label.replace(/[^a-zA-Z0-9]/g, '') === variantSuffix
        );
        if (matchedSize) {
          verifiedPrice = matchedSize.price;
          verifiedName = `${product.name} (${matchedSize.label})`;
        }
        // If no match in sizes array, it's the default/standard size — use base price
      } else if (variantSuffix && !product.sizes) {
        // Variant suffix exists but product has no sizes — use base price
        // This covers the "Standard" size which uses the product's main price
        verifiedPrice = product.price;
      }

      verifiedCart.push({
        ...item,
        price: verifiedPrice,
        name: verifiedName
      });
    } else {
      // Try without treating as variant (full ID might be the doc ID)
      const directRef = doc(db, PRODUCTS_COLLECTION, item.id);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const product = directSnap.data();
        verifiedCart.push({
          ...item,
          price: product.price,
          name: product.name
        });
      } else {
        throw new Error(`Product "${item.name}" is no longer available`);
      }
    }
  }
  return verifiedCart;
}
