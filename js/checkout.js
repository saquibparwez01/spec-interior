// Checkout Module — Razorpay integration + order creation
import { RAZORPAY_KEY_ID } from './firebase-config.js';
import { createOrder } from './orders.js';
import { getCart, getCartTotal, clearCart } from './cart.js';
import { reduceStock } from './products.js';

/**
 * Generate a simple order ID
 */
function generateOrderId() {
  return 'SI' + Date.now().toString(36).toUpperCase();
}

/**
 * Initiate Razorpay payment
 * @param {Object} customerInfo - { name, email, phone, address, city, state, pincode, notes }
 * @param {Object} pricing - { subtotal, shipping, discount, couponCode, grandTotal }
 * @returns {Promise<Object>} - The created order
 */
export function initiatePayment(customerInfo, pricing = null) {
  return new Promise((resolve, reject) => {
    const cart = getCart();
    if (cart.length === 0) {
      reject(new Error('Cart is empty'));
      return;
    }

    const total = pricing ? pricing.grandTotal : getCartTotal();
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
            subtotal: pricing ? pricing.subtotal : getCartTotal(),
            shipping: pricing ? pricing.shipping : 0,
            discount: pricing ? pricing.discount : 0,
            couponCode: pricing ? pricing.couponCode : null,
            total,
            payment: 'online',
            paymentId: response.razorpay_payment_id,
            notes: customerInfo.notes || ''
          });
          // Reduce stock
          await reduceStock(cart);
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
        color: '#4A5D3E'
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
 * @param {Object} pricing - { subtotal, shipping, discount, couponCode, grandTotal }
 */
export async function createCODOrder(customerInfo, pricing = null) {
  const cart = getCart();
  if (cart.length === 0) throw new Error('Cart is empty');

  const total = pricing ? pricing.grandTotal : getCartTotal();
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
    subtotal: pricing ? pricing.subtotal : getCartTotal(),
    shipping: pricing ? pricing.shipping : 0,
    discount: pricing ? pricing.discount : 0,
    couponCode: pricing ? pricing.couponCode : null,
    total,
    payment: 'cod',
    paymentId: null,
    notes: customerInfo.notes || ''
  });

  // Reduce stock
  await reduceStock(cart);
  clearCart();
  return order;
}
