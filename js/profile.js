/**
 * profile.js — Player Profile & Avatar Customization
 */

import * as achModule from './achievements.js';

const SAVE_KEY = 'emoji_party_match_save';
const AVATARS = ['🐱', '🐰', '🐹', '🦊', '🐼', '🐸', '🌸', '🦋', '👑', '🎀'];

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
  catch { return {}; }
}

function writeSave(d) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch {}
}

export function getProfile() {
  const save = loadSave();
  return {
    name: save.profileName || 'Player',
    avatar: save.profileAvatar || '🐱',
    stats: save.stats || {},
    achievements: save.achievements || []
  };
}

export function setProfile(name, avatar) {
  const save = loadSave();
  if (name) save.profileName = name.trim().substring(0, 12);
  if (avatar && AVATARS.includes(avatar)) save.profileAvatar = avatar;
  writeSave(save);
}

export function renderProfileModal(containerEl) {
  const p = getProfile();
  
  const avatarsHtml = AVATARS.map(a => `
    <div class="avatar-option ${a === p.avatar ? 'selected' : ''}" data-avatar="${a}" style="
      font-size: 2rem; cursor: pointer; padding: 4px; text-align: center;
      background: ${a === p.avatar ? 'rgba(255,110,180,0.2)' : 'transparent'};
      border: 2px solid ${a === p.avatar ? '#ff6eb4' : 'transparent'};
      border-radius: 12px; transition: all 0.2s;
    ">${a}</div>
  `).join('');

  containerEl.innerHTML = `
    <h2 class="modal-title" style="margin-bottom:16px">👤 My Profile</h2>
    
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px; background:rgba(255,255,255,0.05); padding:16px; border-radius:16px;">
      <div style="font-size:3.5rem; line-height:1; background:rgba(255,255,255,0.1); border-radius:50%; width:80px; height:80px; display:flex; align-items:center; justify-content:center" id="prof-curr-avatar">
        ${p.avatar}
      </div>
      <div style="flex:1">
        <label style="font-size:0.75rem; color:var(--text-muted); font-weight:700">Username</label>
        <input type="text" id="prof-name-input" value="${p.name}" maxlength="12" style="
          width:100%; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.2);
          color:white; font-family:inherit; font-weight:700; font-size:1.2rem;
          padding:6px 12px; border-radius:8px; margin-top:4px;
        ">
      </div>
    </div>

    <div style="margin-bottom:20px">
      <div style="font-size:0.85rem; font-weight:800; margin-bottom:8px">Pilih Avatar:</div>
      <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px" id="prof-avatar-grid">
        ${avatarsHtml}
      </div>
    </div>

    <div style="margin-bottom:20px; background:rgba(255,255,255,0.05); padding:12px; border-radius:12px">
      <div style="font-size:0.85rem; font-weight:800; margin-bottom:8px">Statistik Kamu:</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.8rem">
        <div>Total Skor: <strong class="gold">${(p.stats.totalScore || 0).toLocaleString()}</strong></div>
        <div>Max Combo: <strong class="pink">${p.stats.maxCombo || 0}</strong></div>
        <div>Total Match: <strong class="cyan">${(p.stats.totalMatches || 0).toLocaleString()}</strong></div>
        <div>Badge: <strong>${p.achievements.length}</strong> / 12</div>
      </div>
    </div>

    <div style="margin-bottom:20px">
      <div style="font-size:0.85rem; font-weight:800; margin-bottom:8px">🏅 Koleksi Badge:</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px" id="prof-badges-list">
        <!-- Badges will be rendered here dynamically to avoid circular dependency if achievements.js isn't imported -->
      </div>
    </div>

    <button class="btn btn-primary w-full" id="btn-save-profile" style="padding:14px;font-size:1.1rem">
      💾 Simpan Profil
    </button>
  `;


  // Directly use achModule instead of dynamic import Promise
  try {
    const badgesHtml = achModule.ACHIEVEMENTS.map(ach => {
      const earned = p.achievements.includes(ach.id);
      const rc = achModule.RARITY_COLORS[ach.rarity] || achModule.RARITY_COLORS.common;
      return `
        <div class="has-tooltip" style="
          width:44px; height:44px; border-radius:12px; 
          background:${earned ? rc.bg : 'rgba(0,0,0,0.3)'}; 
          border:1px solid ${earned ? rc.border : 'rgba(255,255,255,0.1)'};
          display:flex; align-items:center; justify-content:center; font-size:1.5rem;
          opacity:${earned ? '1' : '0.3'}; filter:${earned ? 'none' : 'grayscale(100%)'};
        ">
          ${ach.icon}
          <div class="tooltip" style="width:140px;text-align:center">
            <div style="font-weight:bold;color:${rc.text};margin-bottom:4px">${ach.name}</div>
            <div style="font-size:0.75rem;color:white">${ach.desc}</div>
          </div>
        </div>
      `;
    }).join('');
    const badgesContainer = containerEl.querySelector('#prof-badges-list');
    if (badgesContainer) badgesContainer.innerHTML = badgesHtml;
  } catch(e) {
    console.error('Failed to load achievements', e);
  }

  // Bind avatar selection
  const grid = containerEl.querySelector('#prof-avatar-grid');
  const currAv = containerEl.querySelector('#prof-curr-avatar');
  let selectedAvatar = p.avatar;

  grid.addEventListener('click', e => {
    const opt = e.target.closest('.avatar-option');
    if (!opt) return;
    
    // update ui
    grid.querySelectorAll('.avatar-option').forEach(el => {
      el.classList.remove('selected');
      el.style.background = 'transparent';
      el.style.border = '2px solid transparent';
    });
    opt.classList.add('selected');
    opt.style.background = 'rgba(255,110,180,0.2)';
    opt.style.border = '2px solid #ff6eb4';
    
    selectedAvatar = opt.dataset.avatar;
    currAv.textContent = selectedAvatar;
  });

  // Bind save
  containerEl.querySelector('#btn-save-profile').addEventListener('click', () => {
    const name = containerEl.querySelector('#prof-name-input').value;
    setProfile(name, selectedAvatar);
    
    // Close logic will be handled by the caller, but we provide visual feedback
    const btn = containerEl.querySelector('#btn-save-profile');
    btn.textContent = '✅ Tersimpan!';
    btn.style.background = '#10b981';
    setTimeout(() => {
      document.getElementById('profile-overlay')?.classList.add('hidden');
    }, 500);
  });
}

export default { getProfile, setProfile, renderProfileModal, AVATARS };
