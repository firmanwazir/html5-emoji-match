/**
 * main.js — Entry point for game.html
 * Orchestrates Board, Party, Audio, UI + new features
 */

import Board       from './board.js';
import PartySystem from './party.js';
import Audio       from './audio.js';
import { LEVELS }  from './levels.js';
import {
  updateScore, updateMoves, renderGoals,
  calcStars, showWinModal, showLoseModal, updateBoosterBtn
} from './ui.js';
import { ConfettiSystem } from './animator.js';
import lives from './lives.js';
import Mascot from './mascot.js';
import { checkAchievements, updateStats, showAchievementToast } from './achievements.js';
import { getDailyStatus } from './daily-reward.js';
import Story from './story.js';
import { shareScore } from './share.js';
import quests from './quests.js';

// ─── Save System ──────────────────────────────────────────────────────────────

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
  return {
    level:    1,
    coins:    0,
    stars:    {},
    boosters: { hammer: 3, bomb: 2, rocket: 2, rainbow: 1 },
    sound:    true
  };
}

function writeSave(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// ─── Sparkle background ──────────────────────────────────────────────────────

function initSparkles() {
  const container = document.querySelector('.bg-sparkles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left    = `${Math.random() * 100}%`;
    s.style.top     = `${Math.random() * 100}%`;
    s.style.setProperty('--d',     `${2 + Math.random() * 4}s`);
    s.style.setProperty('--delay', `${Math.random() * 5}s`);
    s.style.setProperty('--op',    `${0.3 + Math.random() * 0.7}`);
    s.style.setProperty('--sz',    `${6 + Math.floor(Math.random() * 10)}px`);
    container.appendChild(s);
  }
}

// ─── Responsive Board Sizing ──────────────────────────────────────────────────

function resizeBoard() {
  const topHud    = document.getElementById('top-hud');
  const bottomBar = document.getElementById('bottom-bar');
  const boardWrap = document.getElementById('board-wrap');
  const container = document.getElementById('board-container');
  if (!container || !boardWrap) return;

  const hudH   = topHud     ? topHud.offsetHeight     : 100;
  const botH   = bottomBar  ? bottomBar.offsetHeight  : 70;
  const margin = 14;
  const availH = Math.max(window.innerHeight - hudH - botH - margin, 160);
  const availW = boardWrap.clientWidth - 16;
  const size   = Math.min(availH, availW, 520);

  container.style.width  = `${size}px`;
  container.style.height = `${size}px`;
}

// ─── Main Game Init ───────────────────────────────────────────────────────────

function initGame() {
  initSparkles();

  // Get level from URL
  const params   = new URLSearchParams(window.location.search);
  const levelId  = parseInt(params.get('level') || '1', 10);
  const levelData = LEVELS.find(l => l.id === levelId) || LEVELS[0];

  let saveData = loadSave();

  // Check sound setting
  Audio.setEnabled(saveData.sound !== false);
  const startAudioContext = () => {
    if (saveData.sound !== false) Audio.startBGM();
    document.removeEventListener('click', startAudioContext);
  };
  document.addEventListener('click', startAudioContext);

  // ─── DOM refs ─────────────────────────────────────────────────────────────
  const boardEl        = document.getElementById('board');
  const scoreEl        = document.getElementById('score-val');
  const movesEl        = document.getElementById('moves-val');
  const goalEl         = document.getElementById('goal-display');
  const levelLabelEl   = document.getElementById('level-label');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const partyFillEl    = document.getElementById('party-meter-fill');
  const partyPctEl     = document.getElementById('party-pct');
  const partyOverlay   = document.getElementById('party-time-overlay');
  const partyBanner    = document.getElementById('party-banner');
  const partyTimerBar  = document.getElementById('party-timer-bar');
  const comboDisplay   = document.getElementById('combo-display');
  const winOverlay     = document.getElementById('win-overlay');
  const loseOverlay    = document.getElementById('lose-overlay');
  const pauseOverlay   = document.getElementById('pause-overlay');

  // Booster buttons
  const hammerBtn  = document.getElementById('booster-hammer');
  const bombBtn    = document.getElementById('booster-bomb');
  const rocketBtn  = document.getElementById('booster-rocket');
  const rainbowBtn = document.getElementById('booster-rainbow');
  const pauseBtn   = document.getElementById('pause-btn');

  // Set level label
  if (levelLabelEl) levelLabelEl.textContent = `Level ${levelData.id}`;

  // ─── Confetti ─────────────────────────────────────────────────────────────
  const confetti = new ConfettiSystem(confettiCanvas);

  // ─── Party System ─────────────────────────────────────────────────────────
  const party = new PartySystem();
  party.init({
    fillEl:    partyFillEl,
    pctEl:     partyPctEl,
    overlayEl: partyOverlay,
    bannerEl:  partyBanner,
    timerBarEl: partyTimerBar,
    confetti
  });
  party.onActive = () => {
    Audio.playPartyVoice?.();
    Mascot.setPartyMode(true);
    updateStats({ totalParties: 1 });
    checkAchievements(showAchievementToast);
    quests.addProgress('party', 1);
  };
  party.onEnd = () => Mascot.setPartyMode(false);

  // ─── Mascot ───────────────────────────────────────────────────────────────
  Mascot.mount('mascot-container');

  // ─── Lives Check ──────────────────────────────────────────────────────────
  const noLivesOverlay = document.getElementById('no-lives-overlay');
  const livesTimerEl   = document.getElementById('lives-regen-timer');

  function updateNoLivesTimer() {
    if (!noLivesOverlay || noLivesOverlay.classList.contains('hidden')) return;
    const ms = lives.getNextRegenMs();
    if (ms !== null && livesTimerEl) {
      livesTimerEl.textContent = lives.formatCountdown(ms);
    }
  }
  setInterval(updateNoLivesTimer, 1000);

  if (!lives.hasLives()) {
    if (noLivesOverlay) noLivesOverlay.classList.remove('hidden');
    updateNoLivesTimer();
    return; // Block level start
  }

  // ─── Board ────────────────────────────────────────────────────────────────
  const board = new Board();
  board.confetti = confetti;

  // Resize board BEFORE init so tiles are correct size from start
  resizeBoard();

  // Run Story -> Start Board
  function startLevel() {
    board.init(boardEl, levelData, party);
    requestAnimationFrame(() => { resizeBoard(); resizeBoard(); });
    window.addEventListener('resize', resizeBoard);
  }

  if (Story.hasStory(levelId, 'before')) {
    Story.showDialog(levelId, 'before', startLevel);
  } else {
    startLevel();
  }

  // Initial UI
  updateScore(scoreEl, 0);
  updateMoves(movesEl, levelData.moves);
  renderGoals(goalEl, board.objectives);
  updateBoosterBtn(hammerBtn, saveData.boosters.hammer);
  updateBoosterBtn(bombBtn,   saveData.boosters.bomb);
  updateBoosterBtn(rocketBtn, saveData.boosters.rocket);
  updateBoosterBtn(rainbowBtn, saveData.boosters.rainbow);

  // ─── Board Callbacks ──────────────────────────────────────────────────────
  board.onScoreChange = (score) => updateScore(scoreEl, score);
  board.onMovesChange = (moves) => updateMoves(movesEl, moves);
  board.onObjectiveUpdate = (objectives) => renderGoals(goalEl, objectives);
  
  board.onObstacleDestroy = (type) => {
    quests.addProgress('destroy', 1);
  };

  board.onMatch = (matchSize) => {
    updateStats({ totalMatches: 1 });
    if (matchSize >= 5) updateStats({ rainbowsUsed: 1 });
    checkAchievements(showAchievementToast);
    quests.addProgress('match', 1);

    if (!party.active) {
      if (Math.random() < 0.3) Audio.playMatchVoice?.();
      Mascot.react(matchSize >= 4 ? 'excited' : 'happy');
    }
  };

  board.onCombo = (combo) => {
    updateStats({ maxCombo: combo });
    checkAchievements(showAchievementToast);
    if (combo >= 2) quests.addProgress('combo', 1);

    if (combo >= 3) {
      Audio.playComboVoice?.();
      Mascot.react(combo >= 5 ? 'veryExcited' : 'excited');
    }
  };

  board.onWin = (score, movesLeft, objectives) => {
    const stars = calcStars(objectives, levelData.starThresholds);
    // Save stats & stars
    saveData.stars[levelId] = Math.max(saveData.stars[levelId] || 0, stars);
    saveData.coins += score;
    saveData.level  = Math.max(saveData.level, levelId + 1);
    writeSave(saveData);

    updateStats({
      totalScore: score,
      bestScore: score,
      highestLevel: levelId,
      totalStars: stars
    });
    checkAchievements(showAchievementToast);
    quests.addProgress('win_level', 1);
    quests.addProgress('play_level', 1);

    Mascot.react('win');

    // Show win routine
    const showWin = () => {
      const winModal = winOverlay?.querySelector('.modal-card');
      if (winModal) {
        winModal.querySelector('#win-score').textContent = score.toLocaleString();
        // Stars
        const starRow = winModal.querySelector('.star-row');
        if (starRow) {
          starRow.innerHTML = '';
          for (let i = 0; i < 3; i++) {
            const s = document.createElement('span');
            s.className = `star-icon${i < stars ? ' earned' : ''}`;
            s.textContent = '⭐';
            s.style.animationDelay = `${0.2 + i * 0.15}s`;
            starRow.appendChild(s);
          }
        }
        // Goal summary
        const summary = winModal.querySelector('.goal-summary');
        if (summary) {
          summary.innerHTML = '';
          for (const obj of objectives) {
            const row = document.createElement('div');
            row.className = 'goal-row';
            const done = obj.current >= obj.target;
            row.innerHTML = `
              <span>${obj.emoji} ${obj.type === 'collect' ? 'Collected' : 'Destroyed'}</span>
              <span class="${done ? 'done' : 'fail'}">${obj.current}/${obj.target} ${done ? '✓' : '✗'}</span>
            `;
            summary.appendChild(row);
          }
        }

        // Add Share button if not exists
        let shareBtn = document.getElementById('btn-win-share');
        if (!shareBtn) {
          const btnGroup = winModal.querySelector('.modal-buttons');
          shareBtn = document.createElement('button');
          shareBtn.id = 'btn-win-share';
          shareBtn.className = 'btn btn-primary';
          shareBtn.style.background = 'linear-gradient(135deg, #c084fc, #ff6eb4)';
          shareBtn.innerHTML = '📤 Pamerkan!';
          btnGroup.insertBefore(shareBtn, btnGroup.children[1]); // Put before 'Main Lagi'
        }
        // Always assign onclick to capture latest score
        shareBtn.onclick = () => {
          shareScore({ score, stars, level: levelId, levelName: levelData.world || '' });
        };
      }

      if (winOverlay) winOverlay.classList.remove('hidden');
      confetti.start();
      setTimeout(() => confetti.stop(), 5000);
    };

    if (Story.hasStory(levelId, 'after')) {
      setTimeout(() => Story.showDialog(levelId, 'after', showWin), 1000);
    } else {
      setTimeout(showWin, 1000);
    }
  };

  board.onLose = (score, objectives) => {
    lives.loseLife();
    Mascot.react('sad');
    quests.addProgress('play_level', 1);

    const loseScore = loseOverlay?.querySelector('#lose-score');
    if (loseScore) loseScore.textContent = score.toLocaleString();
    const summary = loseOverlay?.querySelector('.goal-summary');
    if (summary) {
      summary.innerHTML = '';
      for (const obj of objectives) {
        const row = document.createElement('div');
        row.className = 'goal-row';
        const done = obj.current >= obj.target;
        row.innerHTML = `
          <span>${obj.emoji} ${obj.type === 'collect' ? 'Collect' : 'Destroy'}</span>
          <span class="${done ? 'done' : 'fail'}">${obj.current}/${obj.target} ${done ? '✓' : '✗'}</span>
        `;
        summary.appendChild(row);
      }
    }
    setTimeout(() => {
      if (loseOverlay) loseOverlay.classList.remove('hidden');
    }, 1000);
  };

  // ─── Boosters ─────────────────────────────────────────────────────────────

  function useBooster(type) {
    if (saveData.boosters[type] <= 0) return;
    Audio.playBooster();
    saveData.boosters[type]--;
    writeSave(saveData);
    quests.addProgress('booster', 1, type);

    switch(type) {
      case 'hammer':
        board.enableHammer();
        hammerBtn.classList.add('active-mode');
        updateBoosterBtn(hammerBtn, saveData.boosters.hammer);
        break;
      case 'bomb':
        board.placeBombBooster();
        updateBoosterBtn(bombBtn, saveData.boosters.bomb);
        break;
      case 'rocket':
        board.placeRocketBooster();
        updateBoosterBtn(rocketBtn, saveData.boosters.rocket);
        break;
      case 'rainbow':
        board.placeRainbowBooster();
        updateBoosterBtn(rainbowBtn, saveData.boosters.rainbow);
        break;
    }
  }

  hammerBtn?.addEventListener('click', () => {
    if (board.hammerMode) {
      board.disableHammer();
      hammerBtn.classList.remove('active-mode');
    } else {
      useBooster('hammer');
    }
  });
  bombBtn?.addEventListener('click',    () => useBooster('bomb'));
  rocketBtn?.addEventListener('click',  () => useBooster('rocket'));
  rainbowBtn?.addEventListener('click', () => useBooster('rainbow'));

  // ─── Pause ────────────────────────────────────────────────────────────────

  pauseBtn?.addEventListener('click', () => {
    board.inputLocked = true;
    pauseOverlay?.classList.remove('hidden');
  });

  document.getElementById('btn-resume')?.addEventListener('click', () => {
    board.inputLocked = false;
    pauseOverlay?.classList.add('hidden');
  });

  document.getElementById('btn-restart')?.addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('btn-quit')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ─── Win modal buttons ────────────────────────────────────────────────────

  document.getElementById('btn-win-next')?.addEventListener('click', () => {
    const nextLevel = levelId + 1;
    if (LEVELS.find(l => l.id === nextLevel)) {
      window.location.href = `game.html?level=${nextLevel}`;
    } else {
      window.location.href = 'index.html';
    }
  });

  document.getElementById('btn-win-replay')?.addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('btn-win-menu')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ─── Lose modal buttons ───────────────────────────────────────────────────

  document.getElementById('btn-lose-retry')?.addEventListener('click', () => {
    if (lives.hasLives()) window.location.reload();
    else {
      loseOverlay?.classList.add('hidden');
      noLivesOverlay?.classList.remove('hidden');
      updateNoLivesTimer();
    }
  });

  document.getElementById('btn-lose-menu')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ─── No Lives modal buttons ───────────────────────────────────────────────

  document.getElementById('btn-buy-lives')?.addEventListener('click', () => {
    if (lives.buyLives(100)) {
      saveData = loadSave();
      noLivesOverlay?.classList.add('hidden');
      window.location.reload();
    } else {
      alert('Koin tidak cukup! 😢');
    }
  });

  document.getElementById('btn-wait-lives')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.getElementById('btn-quit-lives')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ─── Sound toggle in pause ────────────────────────────────────────────────
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.textContent = saveData.sound ? '🔊 Sound ON' : '🔇 Sound OFF';
    soundToggle.addEventListener('click', () => {
      saveData.sound = !saveData.sound;
      Audio.setEnabled(saveData.sound);
      writeSave(saveData);
      soundToggle.textContent = saveData.sound ? '🔊 Sound ON' : '🔇 Sound OFF';
    });
  }
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
