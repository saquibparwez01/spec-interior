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

  // Cart remove sound — soft descending tone
  function playRemoveSound() {
    if (!isSoundEnabled()) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
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

  // Attach to product card clicks and remove buttons
  document.addEventListener('click', function(e) {
    const productCard = e.target.closest('.product-card, .rec-card, .cat-card');
    const isCartBtn = e.target.closest('.btn-add-cart, .add-to-cart-btn, [id="addToCartBtn"], .cart-add-btn, .add-btn, .cq-inc');
    const isRemoveBtn = e.target.closest('.remove-item-btn, .qty-dec-btn, .cq-dec');
    
    // Don't play tap sound if it's a cart/remove button
    if (productCard && !isCartBtn && !isRemoveBtn) playTapSound();

    // Play remove sound
    if (isRemoveBtn) playRemoveSound();
  });

  // Expose globally
  window.specSounds = { playCartSound, playTapSound, playRemoveSound };
})();
