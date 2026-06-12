/**
 * quests.js — Daily Quests System
 */

const QUEST_SAVE_KEY = 'emoji_party_match_quests';

const QUEST_TEMPLATES = [
  { id: 'play_levels',  type: 'play_level', target: 3, label: 'Mainkan 3 Level', reward: { coins: 80 } },
  { id: 'win_levels',   type: 'win_level',  target: 2, label: 'Menangkan 2 Level', reward: { coins: 100 } },
  { id: 'make_matches', type: 'match',      target: 50, label: 'Buat 50 Match', reward: { coins: 50 } },
  { id: 'make_combos',  type: 'combo',      target: 10, label: 'Buat 10 Combo beruntun', reward: { coins: 60 } },
  { id: 'party_time',   type: 'party',      target: 3, label: 'Aktifkan 3x Party Time', reward: { booster: { hammer: 1 } } },
  { id: 'destroy_obs',  type: 'destroy',    target: 20, label: 'Hancurkan 20 Rintangan', reward: { coins: 120 } },
  { id: 'use_rocket',   type: 'booster',    sub: 'rocket', target: 2, label: 'Gunakan 2x Rocket', reward: { booster: { bomb: 1 } } },
];

function loadQuests() {
  try { return JSON.parse(localStorage.getItem(QUEST_SAVE_KEY)); }
  catch { return null; }
}

function writeQuests(d) {
  try { localStorage.setItem(QUEST_SAVE_KEY, JSON.stringify(d)); } catch {}
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function generateDailyQuests() {
  // Pick 3 random unique templates
  const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3).map(q => ({
    ...q,
    current: 0,
    claimed: false
  }));
  
  const data = {
    date: getTodayString(),
    quests: selected
  };
  writeQuests(data);
  return data;
}

export function getDailyQuests() {
  let data = loadQuests();
  if (!data || data.date !== getTodayString()) {
    data = generateDailyQuests();
  }
  return data.quests;
}

export function addProgress(type, amount = 1, sub = null) {
  const data = loadQuests();
  if (!data || data.date !== getTodayString()) return;

  let updated = false;
  let newlyCompleted = [];

  for (const q of data.quests) {
    if (q.claimed || q.current >= q.target) continue;
    if (q.type === type && (q.sub === undefined || q.sub === sub)) {
      q.current += amount;
      updated = true;
      if (q.current >= q.target) {
        newlyCompleted.push(q);
      }
    }
  }

  if (updated) writeQuests(data);
  return newlyCompleted; // caller can show a toast
}

export function claimQuest(questId) {
  const data = loadQuests();
  if (!data) return false;

  const quest = data.quests.find(q => q.id === questId);
  if (!quest || quest.claimed || quest.current < quest.target) return false;

  quest.claimed = true;
  writeQuests(data);

  // Apply reward
  const MAIN_SAVE = 'emoji_party_match_save';
  try {
    const save = JSON.parse(localStorage.getItem(MAIN_SAVE)) || {};
    if (quest.reward.coins) {
      save.coins = (save.coins || 0) + quest.reward.coins;
    }
    if (quest.reward.booster) {
      save.boosters = save.boosters || {};
      for (const [k, v] of Object.entries(quest.reward.booster)) {
        save.boosters[k] = (save.boosters[k] || 0) + v;
      }
    }
    localStorage.setItem(MAIN_SAVE, JSON.stringify(save));
    return quest.reward;
  } catch { return false; }
}

export function renderQuestModal(containerEl) {
  const quests = getDailyQuests();
  
  let html = `<h2 class="modal-title" style="margin-bottom:16px">📜 Daily Quests</h2>`;
  
  quests.forEach(q => {
    const progress = Math.min(1, q.current / q.target);
    const isComplete = q.current >= q.target;
    
    let rewardText = '';
    if (q.reward.coins) rewardText = `🪙 ${q.reward.coins}`;
    if (q.reward.booster) {
      const type = Object.keys(q.reward.booster)[0];
      const emoji = type==='hammer'?'🔨':type==='bomb'?'💣':type==='rocket'?'🚀':'🌈';
      rewardText = `${emoji} ${q.reward.booster[type]}`;
    }

    html += `
      <div style="background:rgba(255,255,255,0.05); border:1px solid ${isComplete && !q.claimed ? '#ff6eb4' : 'rgba(255,255,255,0.1)'}; border-radius:12px; padding:12px; margin-bottom:10px; display:flex; align-items:center; gap:12px">
        <div style="flex:1">
          <div style="font-size:0.9rem; font-weight:800; color:white; margin-bottom:4px">${q.label}</div>
          
          <div style="height:6px; background:rgba(0,0,0,0.3); border-radius:3px; overflow:hidden; margin-bottom:4px">
            <div style="height:100%; width:${progress*100}%; background:${isComplete ? '#10b981' : '#c084fc'}; transition:width 0.3s"></div>
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700">${Math.min(q.current, q.target)} / ${q.target}</div>
        </div>
        
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
          <div style="font-size:0.75rem; font-weight:800; color:var(--gold)">${rewardText}</div>
          ${q.claimed ? 
            `<button class="btn" style="padding:4px 12px; font-size:0.75rem; opacity:0.5" disabled>Claimed</button>` : 
            `<button class="btn btn-${isComplete ? 'gold' : 'primary'} btn-claim-quest" data-id="${q.id}" style="padding:4px 12px; font-size:0.75rem" ${!isComplete ? 'disabled' : ''}>
              ${isComplete ? '🎁 Claim' : '🔒 Lock'}
            </button>`
          }
        </div>
      </div>
    `;
  });

  containerEl.innerHTML = html;

  // Bind claim buttons
  containerEl.querySelectorAll('.btn-claim-quest').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const reward = claimQuest(id);
      if (reward) {
        // Re-render
        renderQuestModal(containerEl);
        // Dispatch event to update main UI coins if possible
        window.dispatchEvent(new Event('coinsUpdated'));
      }
    });
  });
}

export default { getDailyQuests, addProgress, claimQuest, renderQuestModal };
