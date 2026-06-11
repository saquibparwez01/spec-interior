// Ambient Sound Module — persists across page navigation
(function() {
  const SOUND_KEY = 'specAmbientSound';

  // Create audio element
  const audio = document.createElement('audio');
  audio.id = 'ambientAudio';
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.3;
  audio.src = 'ambient.mp3';
  document.body.appendChild(audio);

  // Create floating toggle button
  const toggle = document.createElement('button');
  toggle.id = 'soundToggle';
  toggle.title = 'Toggle ambient sound';
  toggle.style.cssText = 'display:none;position:fixed;bottom:24px;left:24px;z-index:9996;width:44px;height:44px;border-radius:50%;background:#2E3B28;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);align-items:center;justify-content:center;transition:transform 0.2s,background 0.2s;';
  toggle.innerHTML = `
    <svg class="sound-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>
    <svg class="sound-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="display:none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
  `;
  document.body.appendChild(toggle);

  let isPlaying = false;
  const soundOn = toggle.querySelector('.sound-on');
  const soundOff = toggle.querySelector('.sound-off');

  function updateIcon() {
    if (isPlaying) {
      soundOn.style.display = 'block';
      soundOff.style.display = 'none';
      toggle.style.background = '#2E3B28';
    } else {
      soundOn.style.display = 'none';
      soundOff.style.display = 'block';
      toggle.style.background = '#7A7E72';
    }
  }

  function playSound() {
    audio.volume = 0.3;
    audio.play().then(function() {
      isPlaying = true;
      localStorage.setItem(SOUND_KEY, 'playing');
      toggle.style.display = 'flex';
      updateIcon();
    }).catch(function() {
      // Autoplay blocked — show toggle so user can tap to resume
      isPlaying = false;
      toggle.style.display = 'flex';
      updateIcon();
    });
  }

  function pauseSound() {
    audio.pause();
    isPlaying = false;
    localStorage.setItem(SOUND_KEY, 'paused');
    updateIcon();
  }

  // Toggle click
  toggle.addEventListener('click', function() {
    if (isPlaying) {
      pauseSound();
    } else {
      playSound();
    }
  });

  // Auto-resume: try to play on any user interaction if it was blocked
  function tryAutoResume() {
    const savedState = localStorage.getItem(SOUND_KEY);
    if (savedState === 'playing' && !isPlaying) {
      playSound();
    }
    // Remove listeners once played
    if (isPlaying) {
      document.removeEventListener('click', tryAutoResume);
      document.removeEventListener('touchstart', tryAutoResume);
      document.removeEventListener('scroll', tryAutoResume);
    }
  }

  // Check if user previously enabled sound
  const savedState = localStorage.getItem(SOUND_KEY);
  if (savedState === 'playing') {
    toggle.style.display = 'flex';
    // Try to play immediately
    audio.play().then(function() {
      isPlaying = true;
      updateIcon();
    }).catch(function() {
      // Autoplay blocked — wait for any user interaction to resume
      isPlaying = false;
      updateIcon();
      document.addEventListener('click', tryAutoResume, { once: true });
      document.addEventListener('touchstart', tryAutoResume, { once: true });
      document.addEventListener('scroll', tryAutoResume, { once: true });
    });
  } else if (savedState === 'paused') {
    toggle.style.display = 'flex';
    updateIcon();
  }

  // Expose for popup use
  window.specAmbient = { play: playSound, pause: pauseSound, isActive: function() { return savedState !== null; } };
})();
