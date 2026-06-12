/**
 * ui.js — HUD updates, win/lose modals, level select rendering
 */

/**
 * Update score display
 */
function updateScore(el, score) {
  if (!el) return;
  el.textContent = score.toLocaleString();
  // Pulse animation
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 400);
}

/**
 * Update moves display
 */
function updateMoves(el, moves) {
  if (!el) return;
  el.textContent = moves;
  if (moves <= 5) el.style.color = 'var(--red)';
  else if (moves <= 10) el.style.color = 'var(--gold)';
  else el.style.color = '';
}

/**
 * Render goal display
 */
function renderGoals(containerEl, objectives) {
  if (!containerEl) return;
  containerEl.innerHTML = '';

  const label = document.createElement('span');
  label.className = 'goal-label';
  label.textContent = 'Goal:';
  containerEl.appendChild(label);

  for (const obj of objectives) {
    const item = document.createElement('div');
    item.className = `goal-item${obj.current >= obj.target ? ' done' : ''}`;
    item.innerHTML = `
      <span class="emoji">${obj.emoji}</span>
      <span class="count">${obj.current}/${obj.target}</span>
      ${obj.current >= obj.target ? '<span class="check">✓</span>' : ''}
    `;
    containerEl.appendChild(item);
  }
}

/**
 * Calculate star rating
 */
function calcStars(objectives, thresholds) {
  const total   = objectives.reduce((s, o) => s + o.target, 0);
  const current = objectives.reduce((s, o) => s + Math.min(o.current, o.target), 0);
  const pct     = total > 0 ? (current / total) * 100 : 0;
  if (pct >= thresholds.three) return 3;
  if (pct >= thresholds.two)   return 2;
  if (pct >= thresholds.one)   return 1;
  return 0;
}

/**
 * Render star row (animated)
 */
function renderStars(containerEl, count) {
  if (!containerEl) return;
  containerEl.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('span');
    s.className = `star-icon${i < count ? ' earned' : ''}`;
    s.textContent = '⭐';
    s.style.animationDelay = `${0.1 + i * 0.15}s`;
    containerEl.appendChild(s);
  }
}

/**
 * Show win modal
 */
function showWinModal(modal, { score, stars, objectives, level, levelData }) {
  if (!modal) return;
  modal.querySelector('#win-score').textContent = score.toLocaleString();

  // Stars
  const starRow = modal.querySelector('.star-row');
  renderStars(starRow, stars);

  // Goal summary
  const summary = modal.querySelector('.goal-summary');
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

  const overlay = document.getElementById('win-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

/**
 * Show lose modal
 */
function showLoseModal({ score, objectives }) {
  const overlay = document.getElementById('lose-overlay');
  if (!overlay) return;

  const scoreEl = overlay.querySelector('#lose-score');
  if (scoreEl) scoreEl.textContent = score.toLocaleString();

  const summary = overlay.querySelector('.goal-summary');
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

  overlay.classList.remove('hidden');
}

/**
 * Update booster button state
 */
function updateBoosterBtn(btn, count) {
  if (!btn) return;
  const countEl = btn.querySelector('.booster-count');
  if (countEl) countEl.textContent = count;
  if (count <= 0) btn.classList.add('depleted');
  else btn.classList.remove('depleted');
}

/**
 * Render level select grid
 */
function renderLevelGrid(containerEl, levels, saveData) {
  if (!containerEl) return;
  containerEl.innerHTML = '';

  for (const level of levels) {
    const stars = saveData.stars[level.id] || 0;
    const isUnlocked = level.id === 1 || (saveData.stars[level.id - 1] || 0) > 0;
    const isCompleted = stars > 0;

    const card = document.createElement('div');
    card.className = `level-card${!isUnlocked ? ' locked' : ''}${isCompleted ? ' completed' : ''}`;
    card.dataset.levelId = level.id;

    if (isUnlocked) {
      card.innerHTML = `
        <div class="level-num">${level.id}</div>
        <div class="level-emoji-preview">${level.preview}</div>
        <div class="level-stars">
          <span class="s ${stars >= 1 ? 'earned' : ''}">⭐</span>
          <span class="s ${stars >= 2 ? 'earned' : ''}">⭐</span>
          <span class="s ${stars >= 3 ? 'earned' : ''}">⭐</span>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `game.html?level=${level.id}`;
      });
    } else {
      card.innerHTML = `
        <div class="level-num" style="opacity:0.4">${level.id}</div>
        <div class="level-lock">🔒</div>
        <div class="level-stars">
          <span class="s">⭐</span><span class="s">⭐</span><span class="s">⭐</span>
        </div>
      `;
    }

    containerEl.appendChild(card);
  }
}

export { updateScore, updateMoves, renderGoals, calcStars, renderStars, showWinModal, showLoseModal, updateBoosterBtn, renderLevelGrid };
