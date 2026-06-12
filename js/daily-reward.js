/**
 * daily-reward.js — Daily Login Reward System
 * 7-day cycle, streak tracking, localStorage persistent
 */

const SAVE_KEY   = 'emoji_party_match_save';
const DAILY_KEY  = 'emoji_party_daily';

const REWARDS = [
  { day: 1, type: 'coins',   amount: 50,   label: '50 🪙',           emoji: '🪙' },
  { day: 2, type: 'booster', item: 'hammer', amount: 1, label: '1× 🔨 Hammer', emoji: '🔨' },
  { day: 3, type: 'coins',   amount: 100,  label: '100 🪙',          emoji: '🪙' },
  { day: 4, type: 'booster', item: 'bomb',   amount: 1, label: '1× 💣 Bomb',   emoji: '💣' },
  { day: 5, type: 'booster', item: 'rocket', amount: 2, label: '2× 🚀 Rocket', emoji: '🚀' },
  { day: 6, type: 'coins',   amount: 200,  label: '200 🪙',          emoji: '🪙' },
  { day: 7, type: 'jackpot', coins: 500, booster: 'rainbow', amount: 1,
    label: '500 🪙 + 🌈 Rainbow!', emoji: '🎁' },
];

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
  catch { return {}; }
}
function writeSave(d) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch {}
}
function loadDaily() {
  try { return JSON.parse(localStorage.getItem(DAILY_KEY)) || {}; }
  catch { return {}; }
}
function writeDaily(d) {
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(d)); } catch {}
}

function isSameDay(ts) {
  const a = new Date(ts), b = new Date();
  return a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear();
}

function isConsecutiveDay(ts) {
  if (!ts) return false;
  const a = new Date(ts), b = new Date();
  b.setDate(b.getDate() - 1);
  return a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear();
}

export function getDailyStatus() {
  const daily = loadDaily();
  const claimedToday = daily.lastClaim && isSameDay(daily.lastClaim);
  const streak = daily.streak || 0;
  const dayIndex = ((streak) % REWARDS.length);
  const nextReward = REWARDS[dayIndex];

  return {
    claimedToday,
    streak,
    dayIndex,
    nextReward,
    rewards: REWARDS
  };
}

export function claimDailyReward() {
  const daily  = loadDaily();
  const save   = loadSave();

  // Already claimed today
  if (daily.lastClaim && isSameDay(daily.lastClaim)) return null;

  // Compute streak
  let streak = (daily.streak || 0);
  if (daily.lastClaim && !isConsecutiveDay(daily.lastClaim)) {
    streak = 0; // streak broken
  }

  const reward = REWARDS[streak % REWARDS.length];
  streak++;

  // Apply reward
  if (reward.type === 'coins') {
    save.coins = (save.coins || 0) + reward.amount;
  } else if (reward.type === 'booster') {
    save.boosters = save.boosters || {};
    save.boosters[reward.item] = (save.boosters[reward.item] || 0) + reward.amount;
  } else if (reward.type === 'jackpot') {
    save.coins = (save.coins || 0) + reward.coins;
    save.boosters = save.boosters || {};
    save.boosters[reward.booster] = (save.boosters[reward.booster] || 0) + reward.amount;
  }

  // Save
  writeSave(save);
  writeDaily({ streak, lastClaim: Date.now() });

  return { reward, streak, save };
}

export { REWARDS };
export default { getDailyStatus, claimDailyReward, REWARDS };
