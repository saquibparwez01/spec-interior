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
 * Send WhatsApp notification to admin about new order
 */
export function sendWhatsAppNotification(order, customerInfo) {
  const adminPhone = '919654535236';
  const items = order.items ? order.items.map(i => `• ${i.name} x${i.qty}`).join('\n') : '';
  const message = `🛒 *New Order Received!*\n\n` +
    `*Order ID:* #${order.orderId || order.id}\n` +
    `*Customer:* ${customerInfo.name}\n` +
    `*Phone:* ${customerInfo.phone}\n` +
    `*Email:* ${customerInfo.email}\n\n` +
    `*Items:*\n${items}\n\n` +
    `*Total:* ₹${order.total.toLocaleString()}\n` +
    `*Payment:* ${order.payment === 'cod' ? 'COD' : 'Online'}\n` +
    `*Address:* ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.pincode}\n\n` +
    `Check admin panel for details.`;

  // Open WhatsApp with pre-filled message to admin (for manual send / automation)
  const adminUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

  // Send WhatsApp confirmation to customer
  const customerMessage = `Hi ${customerInfo.name}! 🙏\n\n` +
    `Thank you for your order at *Spec Interior*!\n\n` +
    `*Order ID:* #${order.orderId || order.id}\n` +
    `*Total:* ₹${order.total.toLocaleString()}\n` +
    `*Payment:* ${order.payment === 'cod' ? 'Cash on Delivery' : 'Paid Online'}\n\n` +
    `Your order will be delivered in 7–10 business days.\n\n` +
    `For any queries, reply here or call us at +91 96545 35236.\n\n` +
    `— Team Spec Interior 🌿`;

  const customerUrl = `https://wa.me/91${customerInfo.phone}?text=${encodeURIComponent(customerMessage)}`;

  return { adminUrl, customerUrl };
}
