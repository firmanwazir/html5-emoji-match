/**
 * achievements.js — Achievement & Badge System 🏆
 */

const SAVE_KEY = 'emoji_party_match_save';

export const ACHIEVEMENTS = [
  {
    id: 'first_match',  name: 'First Bloom 🌸',
    desc: 'Selesaikan match pertamamu',
    icon: '🌸', rarity: 'common',
    check: (stats) => (stats.totalMatches || 0) >= 1,
    reward: { coins: 30 }
  },
  {
    id: 'match_100', name: 'Match Maniac 💫',
    desc: 'Buat 100 match',
    icon: '💫', rarity: 'uncommon',
    check: (stats) => (stats.totalMatches || 0) >= 100,
    reward: { coins: 100 }
  },
  {
    id: 'combo_5', name: 'Combo Queen 👑',
    desc: 'Raih combo ×5 untuk pertama kali',
    icon: '👑', rarity: 'uncommon',
    check: (stats) => (stats.maxCombo || 0) >= 5,
    reward: { coins: 80 }
  },
  {
    id: 'party_first', name: 'Party Animal 🎉',
    desc: 'Aktifkan Party Time pertama kali',
    icon: '🎉', rarity: 'uncommon',
    check: (stats) => (stats.totalParties || 0) >= 1,
    reward: { coins: 60 }
  },
  {
    id: 'party_10', name: 'Party Addict 🎊',
    desc: 'Aktifkan Party Time 10 kali',
    icon: '🎊', rarity: 'rare',
    check: (stats) => (stats.totalParties || 0) >= 10,
    reward: { coins: 200 }
  },
  {
    id: 'level_5', name: 'Level Up! ⭐',
    desc: 'Capai level 5',
    icon: '⭐', rarity: 'common',
    check: (stats) => (stats.highestLevel || 0) >= 5,
    reward: { coins: 100 }
  },
  {
    id: 'level_10', name: 'Explorer 🗺️',
    desc: 'Capai level 10',
    icon: '🗺️', rarity: 'uncommon',
    check: (stats) => (stats.highestLevel || 0) >= 10,
    reward: { coins: 200, booster: { hammer: 2 } }
  },
  {
    id: 'score_50k', name: 'Score Star 💎',
    desc: 'Raih skor 50.000 dalam satu level',
    icon: '💎', rarity: 'rare',
    check: (stats) => (stats.bestScore || 0) >= 50000,
    reward: { coins: 300 }
  },
  {
    id: 'stars_10', name: 'Star Collector ✨',
    desc: 'Kumpulkan 10 bintang',
    icon: '✨', rarity: 'uncommon',
    check: (stats) => (stats.totalStars || 0) >= 10,
    reward: { coins: 150 }
  },
  {
    id: 'daily_7', name: 'Dedicated Player 🦋',
    desc: 'Login 7 hari berturut-turut',
    icon: '🦋', rarity: 'rare',
    check: (stats) => (stats.loginStreak || 0) >= 7,
    reward: { coins: 500, booster: { rainbow: 1 } }
  },
  {
    id: 'rainbow_5', name: 'Rainbow Dream 🌈',
    desc: 'Aktifkan Rainbow Bomb 5 kali',
    icon: '🌈', rarity: 'rare',
    check: (stats) => (stats.rainbowsUsed || 0) >= 5,
    reward: { coins: 250 }
  },
  {
    id: 'total_score_1m', name: 'Match Queen 👸',
    desc: 'Skor total kamu mencapai 1.000.000',
    icon: '👸', rarity: 'legendary',
    check: (stats) => (stats.totalScore || 0) >= 1000000,
    reward: { coins: 1000 }
  },
];

const RARITY_COLORS = {
  common: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' },
  uncommon: { bg: 'rgba(134,239,172,0.15)', border: 'rgba(134,239,172,0.4)', text: '#86efac' },
  rare: { bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.4)', text: '#c084fc' },
  legendary: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24' },
};

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
  catch { return {}; }
}
function writeSave(d) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch {}
}

export function checkAchievements(onUnlock) {
  const save   = loadSave();
  const stats  = save.stats || {};
  const earned = save.achievements || [];
  const newlyEarned = [];

  for (const ach of ACHIEVEMENTS) {
    if (earned.includes(ach.id)) continue;
    if (ach.check(stats)) {
      earned.push(ach.id);
      newlyEarned.push(ach);

      // Apply reward
      if (ach.reward.coins)   save.coins = (save.coins || 0) + ach.reward.coins;
      if (ach.reward.booster) {
        save.boosters = save.boosters || {};
        for (const [k,v] of Object.entries(ach.reward.booster)) {
          save.boosters[k] = (save.boosters[k] || 0) + v;
        }
      }
    }
  }

  if (newlyEarned.length > 0) {
    save.achievements = earned;
    writeSave(save);
    newlyEarned.forEach(a => onUnlock && onUnlock(a));
  }

  return newlyEarned;
}

export function updateStats(updates) {
  const save = loadSave();
  save.stats = save.stats || {};
  for (const [k, v] of Object.entries(updates)) {
    if (k === 'totalMatches' || k === 'totalParties' || k === 'rainbowsUsed') {
      save.stats[k] = (save.stats[k] || 0) + v;
    } else if (k === 'maxCombo' || k === 'highestLevel' || k === 'bestScore') {
      save.stats[k] = Math.max(save.stats[k] || 0, v);
    } else if (k === 'totalScore' || k === 'totalStars') {
      save.stats[k] = (save.stats[k] || 0) + v;
    } else {
      save.stats[k] = v;
    }
  }
  writeSave(save);
  return save.stats;
}

export function getEarnedIds() {
  const save = loadSave();
  return save.achievements || [];
}

export function showAchievementToast(achievement) {
  const rc = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; top:16px; left:50%; transform:translateX(-50%);
    z-index:200; display:flex; align-items:center; gap:10px;
    background:${rc.bg}; border:1px solid ${rc.border};
    backdrop-filter:blur(16px);
    border-radius:16px; padding:10px 18px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:slide-down 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    max-width:320px; width:90%;
  `;
  el.innerHTML = `
    <span style="font-size:1.8rem;flex-shrink:0">${achievement.icon}</span>
    <div>
      <div style="font-weight:900;font-size:0.78rem;color:${rc.text};text-transform:uppercase;letter-spacing:1px">Achievement!</div>
      <div style="font-weight:800;font-size:0.9rem;color:white">${achievement.name}</div>
      <div style="font-size:0.7rem;color:rgba(255,255,255,0.6)">${achievement.desc}</div>
    </div>
    <div style="flex-shrink:0;text-align:center">
      <div style="font-size:0.65rem;color:${rc.text}">Reward</div>
      <div style="font-weight:900;font-size:0.85rem;color:white">🪙+${achievement.reward.coins||0}</div>
    </div>
  `;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slide-up 0.3s ease forwards';
    el.style.opacity   = '0';
    setTimeout(() => el.remove(), 350);
  }, 4000);
}

export { RARITY_COLORS };
export default { checkAchievements, updateStats, getEarnedIds, showAchievementToast, ACHIEVEMENTS };
