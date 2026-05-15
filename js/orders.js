// Orders Module — Firebase CRUD
import {
  db, collection, addDoc, getDocs, doc, updateDoc,
  query, orderBy, where, onSnapshot, getDoc
} from './firebase-config.js';

const ORDERS_COLLECTION = 'orders';

/**
 * Create a new order in Firestore
 */
export async function createOrder(orderData) {
  const order = {
    ...orderData,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
  return { id: docRef.id, ...order };
}

/**
 * Get all orders from Firestore
 */
export async function getOrders(statusFilter = null) {
  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get a single order by ID
 */
export async function getOrder(id) {
  const ref = doc(db, ORDERS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Update order status
 */
export async function updateOrderStatus(id, status) {
  const ref = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
}

/**
 * Listen to real-time order changes
 */
export function onOrdersChange(callback) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}
