/**
 * mascot.js — Mochi the Cat Mascot 🐱
 * Reacts to gameplay events with cute animations & speech bubbles
 */

const REACTIONS = {
  idle:      { anim: 'idle',      msg: ['Ayo main! ✨', 'Semangat! 💪', 'Kamu bisa! 🌸'] },
  happy:     { anim: 'happy',     msg: ['Yay~! 🌸', 'Nice one! ✨', 'Bagus! 🎀', 'Good job! 💕'] },
  excited:   { anim: 'excited',   msg: ['COMBO! ⚡', 'Amazing! 🔥', 'Super! 💫', 'Keren banget! ✨'] },
  veryExcited:{ anim: 'veryExcited', msg: ['INCREDIBLE!! 🎉', 'WOW WOW WOW! 🤩', 'SUPER COMBO! ⚡💫'] },
  party:     { anim: 'party',     msg: ['PARTY TIME~! 🎉', 'Yes yes yes! 🎊', 'Yeahhh! 🎀'] },
  sad:       { anim: 'sad',       msg: ['Ups... 😢', 'Jangan menyerah! 💕', 'Coba lagi yuk~ 🌸'] },
  surprised: { anim: 'surprised', msg: ['Woah! 😮', 'Keren! ✨', 'Luar biasa! 💎'] },
  win:       { anim: 'win',       msg: ['MENANG! 🏆', 'Kamu the best! 👑', 'Sempurna! 🌟'] },
  love:      { anim: 'love',      msg: ['Uwu~ 💖', 'So cute! 🩷', 'Love it! 💝'] },
};

const MOCHI_SVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="mochi-svg">
  <!-- Body -->
  <ellipse cx="60" cy="72" rx="35" ry="30" fill="#fff0f8"/>
  <!-- Head -->
  <circle cx="60" cy="48" r="36" fill="#fff0f8"/>
  <!-- Left ear -->
  <ellipse cx="32" cy="20" rx="10" ry="14" fill="#fff0f8" transform="rotate(-15,32,20)"/>
  <ellipse cx="32" cy="20" rx="5" ry="8" fill="#ffb3d9" transform="rotate(-15,32,20)"/>
  <!-- Right ear -->
  <ellipse cx="88" cy="20" rx="10" ry="14" fill="#fff0f8" transform="rotate(15,88,20)"/>
  <ellipse cx="88" cy="20" rx="5" ry="8" fill="#ffb3d9" transform="rotate(15,88,20)"/>
  <!-- Eye left -->
  <g class="mochi-eye-l">
    <ellipse cx="46" cy="46" rx="8" ry="9" fill="#3d1a4a"/>
    <circle cx="49" cy="43" r="3" fill="white"/>
    <circle cx="43" cy="50" r="1.5" fill="white"/>
  </g>
  <!-- Eye right -->
  <g class="mochi-eye-r">
    <ellipse cx="74" cy="46" rx="8" ry="9" fill="#3d1a4a"/>
    <circle cx="77" cy="43" r="3" fill="white"/>
    <circle cx="71" cy="50" r="1.5" fill="white"/>
  </g>
  <!-- Nose -->
  <ellipse cx="60" cy="56" rx="4" ry="3" fill="#ffb3d9"/>
  <!-- Mouth -->
  <path d="M54 60 Q60 66 66 60" stroke="#c084fc" stroke-width="2.5" fill="none" stroke-linecap="round" class="mochi-mouth"/>
  <!-- Cheeks -->
  <circle cx="35" cy="58" r="8" fill="rgba(255,110,180,0.2)" class="mochi-cheek"/>
  <circle cx="85" cy="58" r="8" fill="rgba(255,110,180,0.2)" class="mochi-cheek"/>
  <!-- Whiskers left -->
  <line x1="18" y1="55" x2="40" y2="57" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="18" y1="60" x2="40" y2="60" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <!-- Whiskers right -->
  <line x1="102" y1="55" x2="80" y2="57" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="102" y1="60" x2="80" y2="60" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <!-- Bow tie -->
  <path d="M50 88 L55 93 L50 98 L60 93 L70 98 L65 93 L70 88 L60 93 Z" fill="#ff6eb4" class="mochi-bow"/>
  <!-- Paw left -->
  <ellipse cx="30" cy="100" rx="12" ry="10" fill="#fff0f8"/>
  <circle cx="24" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="30" cy="97" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="36" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <!-- Paw right -->
  <ellipse cx="90" cy="100" rx="12" ry="10" fill="#fff0f8"/>
  <circle cx="84" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="90" cy="97" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="96" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
</svg>`;

export class MascotSystem {
  constructor() {
    this.container    = null;
    this.svgEl        = null;
    this.bubbleEl     = null;
    this.msgTimeout   = null;
    this.idleTimeout  = null;
    this.currentState = 'idle';
  }

  mount(containerId = 'mascot-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.innerHTML = `
      <div id="mascot-wrap">
        <div id="mascot-bubble" class="mascot-bubble hidden"></div>
        <div id="mascot-body" class="mascot-body idle">${MOCHI_SVG}</div>
      </div>
    `;
    this.svgEl    = this.container.querySelector('.mochi-svg');
    this.bubbleEl = document.getElementById('mascot-bubble');
    this.bodyEl   = document.getElementById('mascot-body');

    // Tap to get random idle message
    this.bodyEl.addEventListener('click', () => this.react('love'));
    this._scheduleIdleMessage();
  }

  react(state, overrideMsg = null) {
    const reaction = REACTIONS[state] || REACTIONS.idle;
    const msg      = overrideMsg || reaction.msg[Math.floor(Math.random() * reaction.msg.length)];

    this.currentState = state;
    if (this.bodyEl) {
      this.bodyEl.className = `mascot-body ${state}`;
      // After animation settles, return to idle
      clearTimeout(this._returnTimer);
      if (state !== 'idle' && state !== 'party') {
        this._returnTimer = setTimeout(() => {
          if (this.bodyEl) this.bodyEl.className = 'mascot-body idle';
        }, 2200);
      }
    }
    this._showBubble(msg);
    this._scheduleIdleMessage();
  }

  _showBubble(msg) {
    if (!this.bubbleEl) return;
    clearTimeout(this.msgTimeout);
    this.bubbleEl.textContent = msg;
    this.bubbleEl.classList.remove('hidden');
    this.bubbleEl.style.animation = '';
    void this.bubbleEl.offsetWidth;
    this.bubbleEl.style.animation = 'bubble-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both';
    this.msgTimeout = setTimeout(() => {
      if (this.bubbleEl) {
        this.bubbleEl.style.animation = 'bubble-fade 0.3s ease forwards';
        setTimeout(() => this.bubbleEl?.classList.add('hidden'), 320);
      }
    }, 2500);
  }

  _scheduleIdleMessage() {
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      if (this.currentState === 'idle') {
        const msgs = REACTIONS.idle.msg;
        this._showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
      }
      this._scheduleIdleMessage();
    }, 8000 + Math.random() * 6000);
  }

  setPartyMode(active) {
    if (active) this.react('party');
    else { this.currentState = 'idle'; if(this.bodyEl) this.bodyEl.className = 'mascot-body idle'; }
  }
}

export default new MascotSystem();
