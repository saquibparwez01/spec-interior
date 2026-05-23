// Wishlist Module — manages wishlist state in localStorage
const WISHLIST_KEY = 'specInteriorWishlist';

export function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}

export function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('wishlistUpdated'));
}

export function addToWishlist(product) {
  const list = getWishlist();
  if (!list.find(item => item.id === product.id)) {
    list.push({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || null,
      image: product.image || null,
      color1: product.color1 || '#8B5E3C',
      color2: product.color2 || '#C4714A',
      category: product.category || ''
    });
    saveWishlist(list);
  }
  return list;
}

export function removeFromWishlist(productId) {
  const list = getWishlist().filter(item => item.id !== productId);
  saveWishlist(list);
  return list;
}

export function isInWishlist(productId) {
  return getWishlist().some(item => item.id === productId);
}

export function getWishlistCount() {
  return getWishlist().length;
}
