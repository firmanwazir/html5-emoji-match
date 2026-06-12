/**
 * shop.js — Shop logic: buy boosters with coins
 */

const SAVE_KEY = 'emoji_party_match_save';

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || defaultSave(); }
  catch { return defaultSave(); }
}
function defaultSave() {
  return { level:1, coins:0, stars:{}, boosters:{hammer:3,bomb:2,rocket:2,rainbow:1}, sound:true };
}
function writeSave(d) { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); }

const ITEMS = [
  {
    id: 'hammer', name: '🔨 Hammer', emoji: '🔨', price: 50,
    desc: 'Hapus 1 tile manapun di board',
    gives: { hammer: 1 }
  },
  {
    id: 'bomb', name: '💣 Bomb', emoji: '💣', price: 80,
    desc: 'Hapus semua tile di area 3×3',
    gives: { bomb: 1 }
  },
  {
    id: 'rocket', name: '🚀 Rocket', emoji: '🚀', price: 80,
    desc: 'Hapus 1 baris atau kolom penuh',
    gives: { rocket: 1 }
  },
  {
    id: 'rainbow', name: '🌈 Rainbow', emoji: '🌈', price: 120,
    desc: 'Hapus SEMUA tile jenis tertentu',
    gives: { rainbow: 1 }
  },
  {
    id: 'pack_starter', name: '🎁 Starter Pack', emoji: '🎁', price: 200, bundle: true,
    desc: '3× 🔨  +  2× 💣  +  2× 🚀',
    gives: { hammer: 3, bomb: 2, rocket: 2 }
  },
  {
    id: 'pack_party', name: '🎊 Party Pack', emoji: '🎊', price: 380, bundle: true,
    desc: '5× 🔨  +  3× 💣  +  3× 🚀  +  2× 🌈',
    gives: { hammer: 5, bomb: 3, rocket: 3, rainbow: 2 }
  }
];

let saveData;
let feedbackTimer = null;

function showFeedback(msg, type='success') {
  clearTimeout(feedbackTimer);
  let el = document.getElementById('shop-feedback');
  if (!el) {
    el = document.createElement('div');
    el.id = 'shop-feedback';
    el.className = 'shop-feedback';
    document.body.appendChild(el);
  }
  el.className = `shop-feedback ${type}`;
  el.textContent = msg;
  el.style.display = 'block';
  void el.offsetWidth;
  el.style.animation = 'modal-spring 0.3s ease both';
  feedbackTimer = setTimeout(() => { el.style.display = 'none'; }, 2000);
}

function updateCoinDisplay() {
  const el = document.getElementById('shop-coins-amount');
  if (el) el.textContent = saveData.coins.toLocaleString();
  // Also update all buy buttons
  document.querySelectorAll('.shop-buy-btn').forEach(btn => {
    const itemId = btn.dataset.itemId;
    const item   = ITEMS.find(i => i.id === itemId);
    if (!item) return;
    const canAfford = saveData.coins >= item.price;
    btn.classList.toggle('cannot-afford', !canAfford);
  });
  // Update owned counts
  saveData.boosters = saveData.boosters || {};
  document.querySelectorAll('.owned-count').forEach(el => {
    const id  = el.dataset.booster;
    if (id) el.textContent = saveData.boosters[id] ?? 0;
  });
}

function buyItem(itemId) {
  try {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if (saveData.coins < item.price) {
      alert(`Oops! Koin kamu tidak cukup untuk membeli ${item.name} (Butuh ${item.price} koin, kamu punya ${saveData.coins}).\n\nMainkan level untuk mendapatkan lebih banyak koin!`);
      showFeedback('🪙 Koin tidak cukup!', 'error');
      return;
    }
    saveData.coins -= item.price;
    saveData.boosters = saveData.boosters || {};
    for (const [k, v] of Object.entries(item.gives)) {
      saveData.boosters[k] = (saveData.boosters[k] || 0) + v;
    }
    writeSave(saveData);
    updateCoinDisplay();
    showFeedback(`✅ ${item.name} dibeli!`, 'success');
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function renderShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.innerHTML = '';

  ITEMS.forEach(item => {
    const card = document.createElement('div');
    card.className = `shop-card${item.bundle ? ' bundle' : ''}`;

    const ownedKeys  = Object.keys(item.gives);
    const ownedLines = ownedKeys.map(k => {
      const count = saveData.boosters[k] || 0;
      return `<span style="display:inline-flex;align-items:center;gap:3px">
        <span class="owned-count" data-booster="${k}">${count}</span>×
        ${k==='hammer'?'🔨':k==='bomb'?'💣':k==='rocket'?'🚀':'🌈'}
      </span>`;
    }).join(' ');

    card.innerHTML = `
      <div class="shop-emoji">${item.emoji}</div>
      <div class="${item.bundle ? 'shop-card-info' : ''}">
        <div class="shop-card-name">${item.name}</div>
        <div class="shop-card-desc">${item.desc}</div>
        <div class="shop-card-owned">Dimiliki: ${ownedLines}</div>
      </div>
      <button class="shop-buy-btn ${saveData.coins < item.price ? 'cannot-afford' : ''}"
              data-item-id="${item.id}" onclick="buyItem('${item.id}')">
        🪙 ${item.price}
      </button>
    `;
    grid.appendChild(card);
  });
}

window.buyItem = buyItem;

function initSparkles() {
  const c = document.querySelector('.bg-sparkles');
  if (!c) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left    = `${Math.random()*100}%`;
    s.style.top     = `${Math.random()*100}%`;
    s.style.setProperty('--d',     `${2+Math.random()*5}s`);
    s.style.setProperty('--delay', `${Math.random()*6}s`);
    s.style.setProperty('--op',    `${0.3+Math.random()*0.6}`);
    s.style.setProperty('--sz',    `${6+Math.floor(Math.random()*8)}px`);
    c.appendChild(s);
  }
}

function init() {
  initSparkles();
  saveData = loadSave();
  saveData.boosters = saveData.boosters || {};
  updateCoinDisplay();
  renderShop();

  document.getElementById('shop-back-btn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
