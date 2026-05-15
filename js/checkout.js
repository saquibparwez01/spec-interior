// Checkout Module — Razorpay integration + order creation
import { RAZORPAY_KEY_ID } from './firebase-config.js';
import { createOrder } from './orders.js';
import { getCart, getCartTotal, clearCart } from './cart.js';

/**
 * Generate a simple order ID
 */
function generateOrderId() {
  return 'SI' + Date.now().toString(36).toUpperCase();
}

/**
 * Initiate Razorpay payment
 * @param {Object} customerInfo - { name, email, phone, address, city, state, pincode, notes }
 * @returns {Promise<Object>} - The created order
 */
export function initiatePayment(customerInfo) {
  return new Promise((resolve, reject) => {
    const cart = getCart();
    if (cart.length === 0) {
      reject(new Error('Cart is empty'));
      return;
    }

    const total = getCartTotal();
    const orderId = generateOrderId();

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: total * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Spec Interior',
      description: `Order ${orderId} — ${cart.length} item(s)`,
      handler: async function (response) {
        // Payment successful — create order in Firebase
        try {
          const order = await createOrder({
            orderId,
            customer: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.pincode}`,
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty
            })),
            total,
            payment: 'online',
            paymentId: response.razorpay_payment_id,
            notes: customerInfo.notes || ''
          });
          clearCart();
          resolve(order);
        } catch (err) {
          reject(err);
        }
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      theme: {
        color: '#C4714A'
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  });
}

/**
 * Create a COD (Cash on Delivery) order without payment
 */
export async function createCODOrder(customerInfo) {
  const cart = getCart();
  if (cart.length === 0) throw new Error('Cart is empty');

  const total = getCartTotal();
  const orderId = generateOrderId();

  const order = await createOrder({
    orderId,
    customer: customerInfo.name,
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.pincode}`,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty
    })),
    total,
    payment: 'cod',
    paymentId: null,
    notes: customerInfo.notes || ''
  });

  clearCart();
  return order;
}
