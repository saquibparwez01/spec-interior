// UI Sound Effects Module
(function() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Check if user enabled sounds
  function isSoundEnabled() {
    const state = localStorage.getItem('specAmbientSound');
    return state === 'playing' || state === 'paused';
  }

  // Cart add sound — cheerful pop
  function playCartSound() {
    if (!isSoundEnabled()) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.25);
    } catch (e) {}
  }

  // Product tap sound — soft click
  function playTapSound() {
    if (!isSoundEnabled()) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.1);
    } catch (e) {}
  }

  // Attach to product card clicks
  document.addEventListener('click', function(e) {
    const productCard = e.target.closest('.product-card, .rec-card, .cat-card');
    if (productCard) playTapSound();

    const addCartBtn = e.target.closest('.btn-add-cart, .add-to-cart-btn, [id="addToCartBtn"]');
    if (addCartBtn) playCartSound();
  });

  // Expose globally
  window.specSounds = { playCartSound, playTapSound };
})();
