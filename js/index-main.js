/**
 * index-main.js — Entry point for index.html (Level Select)
 */

import { LEVELS } from './levels.js';
import { renderLevelGrid } from './ui.js';
import lives from './lives.js';
import daily from './daily-reward.js';
import profile from './profile.js';
import quests from './quests.js';
import Audio from './audio.js';

const SAVE_KEY = 'emoji_party_match_save';

function loadSave() {
  try {
    const save = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!save) return defaultSave();
    if (!save.stars) save.stars = {};
    if (!save.boosters) save.boosters = {hammer:3,bomb:2,rocket:2,rainbow:1};
    if (!save.achievements) save.achievements = [];
    return save;
  } catch { return defaultSave(); }
}
function defaultSave() {
  return { level:1, coins:0, stars:{}, boosters:{hammer:3,bomb:2,rocket:2,rainbow:1}, sound:true };
}

function initSparkles() {
  const container = document.querySelector('.bg-sparkles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left    = `${Math.random() * 100}%`;
    s.style.top     = `${Math.random() * 100}%`;
    s.style.setProperty('--d',     `${2 + Math.random() * 5}s`);
    s.style.setProperty('--delay', `${Math.random() * 6}s`);
    s.style.setProperty('--op',    `${0.3 + Math.random() * 0.7}`);
    s.style.setProperty('--sz',    `${6 + Math.floor(Math.random() * 10)}px`);
    container.appendChild(s);
  }
}

function updateLivesUI() {
  const livesAmount = document.getElementById('lives-amount');
  const livesTooltip = document.getElementById('lives-regen-tooltip');
  if (livesAmount) livesAmount.textContent = lives.getLives();
  if (livesTooltip) {
    const ms = lives.getNextRegenMs();
    livesTooltip.textContent = ms ? `Regen in: ${lives.formatCountdown(ms)}` : 'Full';
  }
}

function initDailyReward() {
  const status = daily.getDailyStatus();
  if (!status.claimedToday) {
    const overlay = document.getElementById('daily-overlay');
    const grid = document.getElementById('daily-grid');
    const btnClaim = document.getElementById('btn-claim-daily');

    if (grid) {
      grid.innerHTML = status.rewards.map(r => `
        <div style="background:rgba(255,255,255,0.06);border:1px solid ${r.day === status.dayIndex + 1 ? '#ff6eb4' : 'rgba(255,255,255,0.1)'};border-radius:12px;padding:8px 4px;text-align:center;${r.day === 7 ? 'grid-column:span 4;' : ''}">
          <div style="font-size:0.6rem;font-weight:800;color:rgba(216,180,254,0.6);margin-bottom:2px">Day ${r.day}</div>
          <div style="font-size:${r.day === 7 ? '2rem' : '1.4rem'}">${r.emoji}</div>
          <div style="font-size:0.65rem;font-weight:700;margin-top:2px">${r.label}</div>
        </div>
      `).join('');
    }

    if (overlay) overlay.classList.remove('hidden');

    if (btnClaim) {
      btnClaim.onclick = () => {
        const result = daily.claimDailyReward();
        if (result) {
          const coinsEl = document.getElementById('coins-amount');
          if (coinsEl) coinsEl.textContent = result.save.coins.toLocaleString();
        }
        overlay?.classList.add('hidden');
      };
    }
  }
}

function init() {
  initSparkles();
  let saveData = loadSave();

  // Update coins & lives
  const coinsEl = document.getElementById('coins-amount');
  const updateCoinsUI = () => { if (coinsEl) coinsEl.textContent = saveData.coins.toLocaleString(); };
  updateCoinsUI();

  // Event listener for custom coinsUpdated event
  window.addEventListener('coinsUpdated', () => {
    saveData = loadSave();
    updateCoinsUI();
  });

  // Removed duplicate modal logic

  updateLivesUI();
  setInterval(updateLivesUI, 1000);
  lives.startTimer();

  // Daily Reward Popup
  setTimeout(initDailyReward, 600);

  // Render level grid
  const gridEl = document.getElementById('level-grid');
  renderLevelGrid(gridEl, LEVELS, saveData);

  // Settings (sound)
  const soundBtn = document.getElementById('sound-btn');
  Audio.setEnabled(saveData.sound);
  
  // Audio requires user interaction to start context in browsers
  const startAudioContext = () => {
    if (saveData.sound) Audio.startBGM();
    document.removeEventListener('click', startAudioContext);
  };
  document.addEventListener('click', startAudioContext);

  if (soundBtn) {
    soundBtn.textContent = saveData.sound ? '🔊' : '🔇';
    soundBtn.addEventListener('click', () => {
      saveData.sound = !saveData.sound;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      soundBtn.textContent = saveData.sound ? '🔊' : '🔇';
      Audio.setEnabled(saveData.sound);
    });
  }

  // Profile Modal
  const profileOpenBtn = document.getElementById('profile-open-btn');
  const profileOverlay = document.getElementById('profile-modal');
  if (profileOpenBtn && profileOverlay) {
    profileOpenBtn.addEventListener('click', () => {
      let content = profileOverlay.querySelector('.profile-container');
      if (!content) {
        content = document.createElement('div');
        content.className = 'profile-container';
        profileOverlay.querySelector('.modal-card').appendChild(content);
      }
      profile.renderProfileModal(content);
      profileOverlay.classList.remove('hidden');
    });
    profileOverlay.querySelector('#profile-close-btn')?.addEventListener('click', () => {
      profileOverlay.classList.add('hidden');
    });
  }

  // Quests Modal
  const questOpenBtn = document.getElementById('quest-open-btn');
  const questOverlay = document.getElementById('quest-modal');
  if (questOpenBtn && questOverlay) {
    questOpenBtn.addEventListener('click', () => {
      let content = questOverlay.querySelector('.quest-container');
      if (!content) {
        content = document.createElement('div');
        content.className = 'quest-container';
        questOverlay.querySelector('.modal-card').appendChild(content);
      }
      quests.renderQuestModal(content);
      questOverlay.classList.remove('hidden');
    });
    questOverlay.querySelector('#quest-close-btn')?.addEventListener('click', () => {
      questOverlay.classList.add('hidden');
    });
  }

  // Listen for coins updated
  window.addEventListener('coinsUpdated', () => {
    const freshSave = loadSave();
    if (coinsEl) coinsEl.textContent = freshSave.coins.toLocaleString();
  });

  // Floating emoji animation in hero
  const floaters = document.querySelectorAll('.hero-emoji');
  floaters.forEach((el, i) => {
    el.style.animationDelay = `${i * 0.3}s`;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

