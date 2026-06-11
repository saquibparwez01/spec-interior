// UI Sound Effects Module
(function() {
  let audioContext = null;

  function getContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }
  
  // Check if user enabled sounds
  function isSoundEnabled() {
    const state = localStorage.getItem('specAmbientSound');
    return state === 'playing' || state === 'paused';
  }

  // Cart add sound — cheerful pop
  function playCartSound() {
    if (!isSoundEnabled()) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

  // Cart remove sound — soft descending tone (kinda sad)
  function playRemoveSound() {
    if (!isSoundEnabled()) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // Wishlist sound — sweet loveable double chime
  function playWishlistSound() {
    if (!isSoundEnabled()) return;
    try {
      const ctx = getContext();
      // First note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      // Second note (higher, delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.setValueAtTime(0.14, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Product tap sound — soft click
  function playTapSound() {
    if (!isSoundEnabled()) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // Listen for cart updates (fired by cart.js saveCart)
  window.addEventListener('cartUpdated', function() {
    playCartSound();
  });

  // Listen for wishlist updates
  window.addEventListener('wishlistUpdated', function() {
    playWishlistSound();
  });

  // Attach to product card clicks and remove buttons
  document.addEventListener('click', function(e) {
    const productCard = e.target.closest('.product-card, .rec-card, .cat-card');
    const isCartBtn = e.target.closest('.btn-add-cart, .add-to-cart-btn, [id="addToCartBtn"], .cart-add-btn, .add-btn, .cq-inc');
    const isRemoveBtn = e.target.closest('.remove-item-btn, .qty-dec-btn, .cq-dec');
    const isWishlistBtn = e.target.closest('.wishlist-btn, [id="wishlistBtn"]');
    
    // Don't play tap sound if it's a cart/remove/wishlist button
    if (productCard && !isCartBtn && !isRemoveBtn && !isWishlistBtn) playTapSound();

    // Play remove sound
    if (isRemoveBtn) playRemoveSound();
  });

  // Expose globally
  window.specSounds = { playCartSound, playTapSound, playRemoveSound, playWishlistSound };
})();
