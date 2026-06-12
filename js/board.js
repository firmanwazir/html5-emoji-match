/**
 * board.js — Board state management, gravity, fill, swap, special effects
 */

import { findAllMatches, wouldMatch, hasAnyValidMove, getAdjacentCells, getHint, COLS, ROWS } from './matcher.js';
import { EMOJI_NORMAL, TILE_TYPES, SCORE_TABLE, PARTY_FILL, COMBO_MULT, COMBO_BONUS_TEXT } from './levels.js';
import {
  popTiles, bounceIn, fallIn,
  animateSwapFromOldPos, animateInvalidBump,
  showFloatingScore, ConfettiSystem, setupWiggle,
  spawnBombRing, spawnRocketTrail, spawnRainbowFlash, screenShake
} from './animator.js';
import Audio from './audio.js';
import PartySystem from './party.js';

class Board {
  constructor() {
    this.grid = [];          // 2D [ROWS][COLS] of tile objects
    this.tileEls = [];       // 2D [ROWS][COLS] of DOM elements
    this.boardEl = null;
    this.level = null;
    this.score = 0;
    this.moves = 0;
    this.comboCount = 0;

    // Selection state
    this.selectedCell = null;
    this.inputLocked = false;

    // Booster mode
    this.hammerMode = false;

    // Objective tracker
    this.objectives = [];  // { type, emoji, target, current }

    // External refs
    this.party = null;
    this.confetti = null;

    // Callbacks
    this.onScoreChange  = null;
    this.onMovesChange  = null;
    this.onObjectiveUpdate = null;
    this.onWin          = null;
    this.onLose         = null;
    this.onCombo        = null;

    // Touch/drag
    this._touchStart = null;
    this._cryingTimer = 0;

    // Hint timeout
    this._hintTimeout = null;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  init(boardEl, level, party) {
    this.boardEl = boardEl;
    this.level   = level;
    this.party   = party;
    this.score   = 0;
    this.moves   = level.moves;
    this.comboCount = 0;
    this.inputLocked = false;
    this._cryingTimer = 0;

    // Clone objectives
    this.objectives = level.objectives.map(o => ({
      ...o, current: 0
    }));

    // Build grid data
    this._buildGrid(level);
    // Render DOM
    this._renderBoard();
    // Schedule idle wiggles
    this._scheduleWiggles();

    // Tutorial Level 1
    if (this.level.id === 1 && !localStorage.getItem('tutorial_done')) {
      setTimeout(() => this._showTutorial(), 1500);
    }
  }

  // ─── Grid Building ───────────────────────────────────────────────────────

  _buildGrid(level) {
    const cfg = level.boardConfig;
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    // Place obstacles first
    const obstaclePositions = [];
    for (const obs of cfg.obstacles) {
      let placed = 0;
      let attempts = 0;
      while (placed < obs.count && attempts < 100) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (!this.grid[r][c]) {
          this.grid[r][c] = this._makeObstacleTile(obs.type, r, c);
          obstaclePositions.push([r,c]);
          placed++;
        }
        attempts++;
      }
    }

    // Fill remaining with normal emojis, no pre-existing matches
    const emojis = cfg.emojis;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c]) continue;
        let type, emoji;
        let tries = 0;
        do {
          const idx = Math.floor(Math.random() * emojis.length);
          emoji = emojis[idx];
          type  = this._emojiToType(emoji);
          tries++;
        } while (wouldMatch(this.grid, r, c, type) && tries < 20);
        this.grid[r][c] = this._makeNormalTile(type, emoji);
      }
    }
  }

  _makeNormalTile(type, emoji) {
    return { type, emoji, isObstacle: false, hp: null };
  }

  _makeObstacleTile(obsType, r, c) {
    switch (obsType) {
      case 'angry':        return { type: 'angry',        emoji: '😒', isObstacle: true, hp: 1 };
      case 'angry_strong': return { type: 'angry_strong', emoji: '😤', isObstacle: true, hp: 2 };
      case 'sleeping':     return { type: 'sleeping',     emoji: '😪', isObstacle: true, hp: 1 };
      case 'crying':       return { type: 'crying',       emoji: '💔', isObstacle: true, hp: 1, spreadTimer: 3 };
      default:             return { type: obsType, emoji: '❓', isObstacle: true, hp: 1 };
    }
  }

  _makeSpecialTile(specialType) {
    const map = { rocket: '🚀', bomb: '💣', rainbow: '🌈' };
    return { type: specialType, emoji: map[specialType], isObstacle: false, isSpecial: true, hp: null };
  }

  _emojiToType(emoji) {
    const map = {
      '🐱':'cat','🐰':'rabbit','🐹':'hamster',
      '🦊':'fox','🐼':'panda','🐸':'frog'
    };
    return map[emoji] || emoji;
  }

  _randomNormalTile() {
    const emojis = this.level.boardConfig.emojis;
    const emoji  = emojis[Math.floor(Math.random() * emojis.length)];
    return this._makeNormalTile(this._emojiToType(emoji), emoji);
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  _renderBoard() {
    this.boardEl.innerHTML = '';
    const tileSize = this._calcTileSize();
    this.tileEls = [];

    for (let r = 0; r < ROWS; r++) {
      this.tileEls[r] = [];
      for (let c = 0; c < COLS; c++) {
        const el = this._createTileEl(r, c, tileSize);
        this.boardEl.appendChild(el);
        this.tileEls[r][c] = el;
      }
    }
    this._attachBoardEvents();
  }

  _calcTileSize() {
    const boardWidth = this.boardEl.parentElement.clientWidth - 16;
    return Math.floor((Math.min(boardWidth, 400) - (COLS + 1) * 3) / COLS);
  }

  _createTileEl(r, c, size) {
    const cell = this.grid[r][c];
    const el = document.createElement('div');
    el.className = 'tile';
    el.dataset.r    = r;
    el.dataset.c    = c;
    el.dataset.type = cell.type;

    const inner = document.createElement('span');
    inner.className = 'emoji-inner';
    inner.textContent = cell.emoji;
    el.appendChild(inner);

    // HP indicator for obstacles
    if (cell.isObstacle && cell.hp > 1) {
      const hp = document.createElement('span');
      hp.className = 'tile-hp';
      hp.textContent = `×${cell.hp}`;
      el.appendChild(hp);
    }

    // Bounce in on initial render
    setTimeout(() => bounceIn(el, (r * COLS + c) * 15), 50);
    return el;
  }

  _updateTileEl(r, c) {
    const cell = this.grid[r][c];
    const el   = this.tileEls[r][c];
    if (!el || !cell) return;

    el.dataset.type = cell.type;
    const inner = el.querySelector('.emoji-inner');
    if (inner) inner.textContent = cell.emoji;

    // HP badge
    let hpEl = el.querySelector('.tile-hp');
    if (cell.isObstacle && cell.hp > 1) {
      if (!hpEl) { hpEl = document.createElement('span'); hpEl.className = 'tile-hp'; el.appendChild(hpEl); }
      hpEl.textContent = `×${cell.hp}`;
    } else if (hpEl) hpEl.remove();
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  _attachBoardEvents() {
    const el = this.boardEl;

    // Mouse
    el.addEventListener('mousedown', e => this._onPointerDown(e));
    el.addEventListener('mouseup',   e => this._onPointerUp(e));

    // Touch
    el.addEventListener('touchstart', e => { e.preventDefault(); this._onPointerDown(e.touches[0]); }, { passive: false });
    el.addEventListener('touchend',   e => { e.preventDefault(); this._onPointerUp(e.changedTouches[0]); }, { passive: false });
    el.addEventListener('touchmove',  e => { e.preventDefault(); }, { passive: false });
  }

  _getTileFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    const tile = el?.closest?.('.tile');
    if (!tile) return null;
    return { el: tile, r: +tile.dataset.r, c: +tile.dataset.c };
  }

  _onPointerDown(e) {
    if (this.inputLocked) return;
    const hit = this._getTileFromPoint(e.clientX, e.clientY);
    if (!hit) return;
    this._touchStart = hit;
  }

  _onPointerUp(e) {
    if (this.inputLocked || !this._touchStart) return;
    const hit = this._getTileFromPoint(e.clientX, e.clientY);
    if (!hit) { this._touchStart = null; return; }

    const start = this._touchStart;
    this._touchStart = null;

    // Hammer mode
    if (this.hammerMode) {
      this._applyHammer(hit.r, hit.c);
      return;
    }

    if (start.r === hit.r && start.c === hit.c) {
      // Tap = select
      this._handleTap(hit.r, hit.c, hit.el);
    } else {
      // Swipe = swap direction
      const dr = hit.r - start.r;
      const dc = hit.c - start.c;
      const absDr = Math.abs(dr), absDc = Math.abs(dc);
      let targetR = start.r, targetC = start.c;
      if (absDr > absDc) targetR += dr > 0 ? 1 : -1;
      else               targetC += dc > 0 ? 1 : -1;
      if (targetR >= 0 && targetR < ROWS && targetC >= 0 && targetC < COLS) {
        this._deselect();
        this._trySwap(start.r, start.c, targetR, targetC);
      }
    }
  }

  _handleTap(r, c, el) {
    // If tapping a special tile alone, activate it
    if (this.grid[r][c]?.isSpecial && this.selectedCell === null) {
      this._activateSpecial(r, c);
      return;
    }

    if (!this.selectedCell) {
      this._select(r, c, el);
    } else {
      const { r: sr, c: sc, el: sel } = this.selectedCell;
      if (sr === r && sc === c) {
        this._deselect();
        return;
      }
      const dr = Math.abs(sr - r), dc = Math.abs(sc - c);
      if (dr + dc === 1) {
        this._deselect();
        this._trySwap(sr, sc, r, c);
      } else {
        this._deselect();
        this._select(r, c, el);
      }
    }
  }

  _select(r, c, el) {
    this.selectedCell = { r, c, el };
    el.classList.add('selected');
    Audio.playSwap();
  }

  _deselect() {
    if (this.selectedCell) {
      this.selectedCell.el.classList.remove('selected');
      this.selectedCell = null;
    }
  }

  // ─── Swap & Match Loop ───────────────────────────────────────────────────

  async _trySwap(r1, c1, r2, c2) {
    if (this.inputLocked) return;
    const cell1 = this.grid[r1][c1];
    const cell2 = this.grid[r2][c2];

    if (cell1?.isObstacle && cell2?.isObstacle) { Audio.playInvalid(); return; }

    this.inputLocked = true;
    this._clearHintTimeout();

    const el1 = this.tileEls[r1][c1];
    const el2 = this.tileEls[r2][c2];

    // *** CRITICAL FIX: capture positions BEFORE any changes ***
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    // Handle rainbow special swap
    if (cell1?.type === 'rainbow' || cell2?.type === 'rainbow') {
      const rainbowR = cell1?.type === 'rainbow' ? r1 : r2;
      const rainbowC = cell1?.type === 'rainbow' ? c1 : c2;
      const targetR  = cell1?.type === 'rainbow' ? r2 : r1;
      const targetC  = cell1?.type === 'rainbow' ? c2 : c1;
      // Swap data + DOM first
      this.grid[r1][c1] = cell2; this.grid[r2][c2] = cell1;
      this._updateTileEl(r1, c1); this._updateTileEl(r2, c2);
      await animateSwapFromOldPos(el1, el2, rect1, rect2);
      await this._activateRainbow(rainbowR, rainbowC, targetR, targetC);
      this._decrementMoves();
      await this._applyGravity();
      const cm = findAllMatches(this.grid);
      if (cm.length > 0) await this._resolveMatches(cm, false);
      this.inputLocked = false;
      this._scheduleHint();
      if (this._checkWin()) return;
      if (this.moves <= 0) { this._handleLose(); return; }
      return;
    }

    // *** DATA-FIRST: swap grid data temporarily to check matches ***
    this.grid[r1][c1] = cell2;
    this.grid[r2][c2] = cell1;
    const matches = findAllMatches(this.grid);

    if (matches.length === 0) {
      // INVALID SWAP: revert data immediately (DOM never changed)
      this.grid[r1][c1] = cell1;
      this.grid[r2][c2] = cell2;
      // Show bump animation (no DOM content change = no flash)
      await animateInvalidBump(el1, el2);
      Audio.playInvalid();
      this.inputLocked = false;
      this._scheduleHint();
      return;
    }

    // VALID SWAP: update DOM to match swapped data, then animate
    this._updateTileEl(r1, c1);
    this._updateTileEl(r2, c2);
    // Animate from old positions to new (smooth, no flash)
    await animateSwapFromOldPos(el1, el2, rect1, rect2);

    Audio.playSwap();
    this._decrementMoves();
    this.comboCount = 0;
    await this._resolveMatches(matches);
    this.inputLocked = false;
    this._scheduleHint();

    if (this._checkWin()) return;
    if (this.moves <= 0) { this._handleLose(); return; }
    if (!hasAnyValidMove(this.grid)) { this._shuffleBoard(); }
  }

  // ─── Match Resolution ────────────────────────────────────────────────────

  async _resolveMatches(matches, isChain=false) {
    if (matches.length === 0) return;

    if (isChain) {
      this.comboCount++;
      if (this.comboCount >= 2) this._showCombo(this.comboCount);
    }

    const mult = COMBO_MULT[Math.min(this.comboCount || 1, 5)] * this.party.getMultiplier();

    // Collect all cells to destroy
    const toDestroy = new Set();
    const specialSpawns = [];

    for (const match of matches) {
      for (const [r,c] of match.cells) {
        toDestroy.add(`${r},${c}`);
      }

      // Determine special spawn
      let specialType = null;
      if      (match.matchType === 'match5') specialType = 'rainbow';
      else if (match.matchType === 'match4') specialType = 'rocket';
      else if (match.matchType === 'lShape' || match.matchType === 'tShape') specialType = 'bomb';

      if (specialType) {
        specialSpawns.push({ specialType, pivot: match.pivotCell });
      }

      // Score
      const baseScore = SCORE_TABLE[match.matchType] || 30;
      const pts = Math.round(baseScore * mult);
      this.score += pts;

      // Party meter
      const partyFill = PARTY_FILL[match.matchType] || 5;
      this.party.fill(partyFill);

      // Objectives
      this._updateObjectives(match);

      // Audio
      Audio.playPop(this.comboCount);

      // Score popup on first cell
      const [pr, pc] = match.cells[0];
      const el = this.tileEls[pr][pc];
      if (el) {
        const rect = el.getBoundingClientRect();
        const color = this.party.isParty ? 'var(--pink)' : 'var(--gold)';
        showFloatingScore(rect.left + rect.width/2, rect.top, `+${pts}`, color, this.comboCount >= 2);
      }
    }

    // Pop animation
    const popEls = [];
    for (const key of toDestroy) {
      const [r,c] = key.split(',').map(Number);
      if (this.tileEls[r][c]) popEls.push(this.tileEls[r][c]);
    }
    await popTiles(popEls);

    // Damage adjacent obstacles
    for (const key of toDestroy) {
      const [r,c] = key.split(',').map(Number);
      const adj = getAdjacentCells(r, c);
      for (const [ar, ac] of adj) {
        const cell = this.grid[ar][ac];
        if (cell?.isObstacle && !toDestroy.has(`${ar},${ac}`)) {
          await this._damageObstacle(ar, ac, r, c);
        }
      }
    }

    // Clear destroyed cells
    for (const key of toDestroy) {
      const [r,c] = key.split(',').map(Number);
      this.grid[r][c] = null;
    }

    // Place specials at pivots (instead of null)
    for (const { specialType, pivot } of specialSpawns) {
      const [pr, pc] = pivot;
      if (this.grid[pr][pc] === null) {
        this.grid[pr][pc] = this._makeSpecialTile(specialType);
      }
    }

    if (this.onScoreChange) this.onScoreChange(this.score);

    // Apply gravity
    await this._applyGravity();

    // Check chain matches
    const chainMatches = findAllMatches(this.grid);
    if (chainMatches.length > 0) {
      await this._resolveMatches(chainMatches, true);
    }

    // Crying emoji spread
    this._cryingTimer++;
    if (this._cryingTimer >= 3) {
      this._cryingTimer = 0;
      this._spreadCrying();
    }
  }

  async _applyGravity() {
    // Move tiles down to fill gaps
    let moved = false;
    for (let c = 0; c < COLS; c++) {
      let writeR = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (r !== writeR) {
            this.grid[writeR][c] = this.grid[r][c];
            this.grid[r][c]      = null;
            moved = true;
          }
          writeR--;
        }
      }
      // Fill top with new tiles
      for (let r = writeR; r >= 0; r--) {
        this.grid[r][c] = this._randomNormalTile();
        moved = true;
      }
    }

    // Re-render all tiles with fall animation
    this._rerenderAll(true);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  _rerenderAll(animate=false) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el   = this.tileEls[r][c];
        const cell = this.grid[r][c];
        if (!el || !cell) continue;
        el.dataset.type = cell.type;
        const inner = el.querySelector('.emoji-inner');
        if (inner) inner.textContent = cell.emoji;
        // Remove hp
        const hp = el.querySelector('.tile-hp');
        if (hp) hp.remove();
        if (cell.isObstacle && cell.hp > 1) {
          const hpEl = document.createElement('span');
          hpEl.className = 'tile-hp';
          hpEl.textContent = `×${cell.hp}`;
          el.appendChild(hpEl);
        }
        if (animate) {
          const delay = c * 20 + r * 5;
          fallIn(el, delay);
        }
      }
    }
  }

  // ─── Obstacle Damage ─────────────────────────────────────────────────────

  async _damageObstacle(r, c, fromR, fromC) {
    const cell = this.grid[r][c];
    if (!cell || !cell.isObstacle) return;

    cell.hp = (cell.hp || 1) - 1;
    const el = this.tileEls[r][c];

    if (cell.hp <= 0) {
      // Destroy obstacle
      await popTiles([el]);
      this.grid[r][c] = null;
      // Update objectives for destroy type
      this._updateObjectivesDestroy(cell.type);
      if (this.onObstacleDestroy) this.onObstacleDestroy(cell.type);
      // Confetti burst at position
      if (this.confetti) {
        const rect = el.getBoundingClientRect();
        this.confetti.burst(rect.left + rect.width/2, rect.top + rect.height/2, 8);
      }
    } else {
      // Shake tile
      el.classList.add('invalid-swap');
      setTimeout(() => el.classList.remove('invalid-swap'), 450);
      this._updateTileEl(r, c);
    }
  }

  // ─── Special Activations ─────────────────────────────────────────────────

  async _activateSpecial(r, c) {
    if (this.inputLocked) return;
    const cell = this.grid[r][c];
    if (!cell?.isSpecial) return;

    this.inputLocked = true;
    this._decrementMoves();
    this.comboCount = 0;

    if (cell.type === 'rocket')  await this._activateRocket(r, c);
    if (cell.type === 'bomb')    await this._activateBomb(r, c);
    if (cell.type === 'rainbow') {
      // Rainbow without pair — pick random type
      const emojis = this.level.boardConfig.emojis;
      const targetEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      await this._clearAllOfType(this._emojiToType(targetEmoji));
      
      const el = this.tileEls[r][c];
      if (el) await popTiles([el]);
      this.grid[r][c] = null;
    }

    await this._applyGravity();
    const chainMatches = findAllMatches(this.grid);
    if (chainMatches.length > 0) await this._resolveMatches(chainMatches, true);

    this.inputLocked = false;
    if (this._checkWin()) return;
    if (this.moves <= 0) this._handleLose();
  }

  async _activateRocket(r, c) {
    Audio.playRocket();
    this.party.fill(PARTY_FILL.rocket);
    this.grid[r][c] = null;

    const clearRow = Math.random() > 0.5;
    const toDestroy = [];
    if (clearRow) {
      for (let cc = 0; cc < COLS; cc++) toDestroy.push([r, cc]);
    } else {
      for (let rr = 0; rr < ROWS; rr++) toDestroy.push([rr, c]);
    }

    // Rocket trail animation
    const firstEl = this.tileEls[toDestroy[0][0]][toDestroy[0][1]];
    const lastEl  = this.tileEls[toDestroy[toDestroy.length-1][0]][toDestroy[toDestroy.length-1][1]];
    if (firstEl && lastEl) {
      const r1 = firstEl.getBoundingClientRect();
      const r2 = lastEl.getBoundingClientRect();
      spawnRocketTrail(r1.left, r1.top + r1.height/2, r2.right, r2.top + r2.height/2, clearRow);
    }

    const pts = SCORE_TABLE.rocket * this.party.getMultiplier();
    this.score += pts;
    if (this.onScoreChange) this.onScoreChange(this.score);

    const els = toDestroy.map(([rr,cc]) => this.tileEls[rr][cc]).filter(Boolean);
    await popTiles(els);
    for (const [rr,cc] of toDestroy) this.grid[rr][cc] = null;
  }

  async _activateBomb(r, c) {
    Audio.playBomb();
    this.party.fill(PARTY_FILL.bomb);
    const pts = SCORE_TABLE.bomb * this.party.getMultiplier();
    this.score += pts;
    if (this.onScoreChange) this.onScoreChange(this.score);

    // Shockwave ring at bomb center
    const bombEl = this.tileEls[r][c];
    if (bombEl) {
      const rect = bombEl.getBoundingClientRect();
      spawnBombRing(rect.left + rect.width/2, rect.top + rect.height/2);
    }

    const toDestroy = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
          toDestroy.push([rr, cc]);
        }
      }
    }
    const els = toDestroy.map(([rr,cc]) => this.tileEls[rr][cc]).filter(Boolean);
    await popTiles(els);
    for (const [rr,cc] of toDestroy) this.grid[rr][cc] = null;

    // Confetti burst
    if (this.confetti) {
      const rect2 = this.tileEls[r]?.[c]?.getBoundingClientRect?.();
      if (rect2) this.confetti.burst(rect2.left + rect2.width/2, rect2.top + rect2.height/2, 20);
    }
  }

  async _activateRainbow(rr, cc, targetR, targetC) {
    Audio.playRainbow();
    this.party.fill(PARTY_FILL.rainbow);
    spawnRainbowFlash();
    const targetType = this.grid[targetR][targetC]?.type;
    if (targetType) {
      await this._clearAllOfType(targetType);
    }
    
    // Destroy rainbow tile itself (target tile is destroyed by _clearAllOfType if it's a normal tile, 
    // but just to be safe we pop both)
    const elsToPop = [];
    if (this.grid[rr][cc]) elsToPop.push(this.tileEls[rr][cc]);
    if (this.grid[targetR][targetC] && this.grid[targetR][targetC].type !== targetType) {
       elsToPop.push(this.tileEls[targetR][targetC]);
    }
    if (elsToPop.length > 0) await popTiles(elsToPop);

    this.grid[rr][cc]           = null;
    this.grid[targetR][targetC] = null;
  }

  async _clearAllOfType(type) {
    const toDestroy = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c]?.type === type) toDestroy.push([r,c]);
      }
    }
    const pts = SCORE_TABLE.rainbow * this.party.getMultiplier();
    this.score += Math.round(pts);
    if (this.onScoreChange) this.onScoreChange(this.score);
    const els = toDestroy.map(([r,c]) => this.tileEls[r][c]).filter(Boolean);
    await popTiles(els);
    for (const [r,c] of toDestroy) this.grid[r][c] = null;
  }

  // ─── Boosters ────────────────────────────────────────────────────────────

  enableHammer() {
    this.hammerMode = true;
    document.body.classList.add('hammer-mode');
  }
  disableHammer() {
    this.hammerMode = false;
    document.body.classList.remove('hammer-mode');
  }

  async _applyHammer(r, c) {
    this.disableHammer();
    Audio.playBomb();
    const el = this.tileEls[r][c];
    if (el) await popTiles([el]);
    this.grid[r][c] = null;
    this._decrementMoves();
    await this._applyGravity();
    const matches = findAllMatches(this.grid);
    if (matches.length > 0) await this._resolveMatches(matches, false);
    this.inputLocked = false;
    if (this._checkWin()) return;
    if (this.moves <= 0) this._handleLose();
  }

  async placeBombBooster() {
    if (this.inputLocked) return;
    // Place bomb at random empty-ish position
    const positions = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!this.grid[r][c]?.isObstacle && !this.grid[r][c]?.isSpecial)
          positions.push([r,c]);
    if (positions.length === 0) return;
    const [r,c] = positions[Math.floor(Math.random() * positions.length)];
    this.grid[r][c] = this._makeSpecialTile('bomb');
    this._updateTileEl(r, c);
    Audio.playBooster();
    bounceIn(this.tileEls[r][c]);
  }

  async placeRocketBooster() {
    const positions = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!this.grid[r][c]?.isObstacle && !this.grid[r][c]?.isSpecial)
          positions.push([r,c]);
    if (positions.length === 0) return;
    const [r,c] = positions[Math.floor(Math.random() * positions.length)];
    this.grid[r][c] = this._makeSpecialTile('rocket');
    this._updateTileEl(r, c);
    Audio.playBooster();
    bounceIn(this.tileEls[r][c]);
  }

  async placeRainbowBooster() {
    const positions = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!this.grid[r][c]?.isObstacle && !this.grid[r][c]?.isSpecial)
          positions.push([r,c]);
    if (positions.length === 0) return;
    const [r,c] = positions[Math.floor(Math.random() * positions.length)];
    this.grid[r][c] = this._makeSpecialTile('rainbow');
    this._updateTileEl(r, c);
    Audio.playBooster();
    bounceIn(this.tileEls[r][c]);
  }

  // ─── Objectives ──────────────────────────────────────────────────────────

  _updateObjectives(match) {
    for (const obj of this.objectives) {
      if (obj.type === 'collect') {
        const matchEmoji = match.emoji;
        if (matchEmoji === obj.emoji && obj.current < obj.target) {
          obj.current = Math.min(obj.target, obj.current + match.cells.length);
          if (this.onObjectiveUpdate) this.onObjectiveUpdate(this.objectives);
        }
      }
    }
  }

  _updateObjectivesDestroy(obstacleType) {
    for (const obj of this.objectives) {
      if (obj.type === 'destroy') {
        const typeMap = { angry: '😡', angry_strong: '😠', sleeping: '😴', crying: '😭' };
        const targetEmoji = obj.emoji;
        const matchedType = Object.entries(typeMap).find(([t, e]) => e === targetEmoji)?.[0];
        if (matchedType === obstacleType && obj.current < obj.target) {
          obj.current++;
          if (this.onObjectiveUpdate) this.onObjectiveUpdate(this.objectives);
        }
      }
    }
  }

  _checkWin() {
    const allDone = this.objectives.every(o => o.current >= o.target);
    if (allDone) {
      setTimeout(() => {
        Audio.playWin();
        if (this.onWin) this.onWin(this.score, this.moves, this.objectives);
      }, 400);
      return true;
    }
    return false;
  }

  // ─── Moves ───────────────────────────────────────────────────────────────

  _decrementMoves() {
    this.moves = Math.max(0, this.moves - 1);
    if (this.onMovesChange) this.onMovesChange(this.moves);
  }

  _handleLose() {
    setTimeout(() => {
      Audio.playLose();
      if (this.onLose) this.onLose(this.score, this.objectives);
    }, 400);
  }

  // ─── Crying Spread ───────────────────────────────────────────────────────

  _spreadCrying() {
    const crying = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (this.grid[r][c]?.type === 'crying') crying.push([r,c]);

    for (const [r,c] of crying) {
      const adj = getAdjacentCells(r,c);
      const empty = adj.filter(([ar,ac]) => this.grid[ar][ac] && !this.grid[ar][ac].isObstacle && !this.grid[ar][ac].isSpecial);
      if (empty.length > 0) {
        const [tr,tc] = empty[Math.floor(Math.random() * empty.length)];
        this.grid[tr][tc] = { type: 'crying', emoji: '😭', isObstacle: true, hp: 1 };
        this._updateTileEl(tr, tc);
        fallIn(this.tileEls[tr][tc]);
      }
    }
  }

  // ─── Board Shuffle (deadlock) ─────────────────────────────────────────────

  _shuffleBoard() {
    // Fisher-Yates shuffle of non-obstacle tiles
    const positions = [];
    const tiles = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (this.grid[r][c] && !this.grid[r][c].isObstacle && !this.grid[r][c].isSpecial) {
          positions.push([r,c]);
          tiles.push(this.grid[r][c]);
        }
    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    tiles.forEach((t, i) => {
      const [r,c] = positions[i];
      this.grid[r][c] = t;
    });
    this._rerenderAll(true);
  }

  // ─── Combo display ───────────────────────────────────────────────────────

  _showCombo(count) {
    const el = document.getElementById('combo-display');
    if (!el) return;
    const texts = { 2:'NICE! ×2',3:'GREAT! ×3',4:'AMAZING! ×4',5:'🎉 PARTY BONUS!' };
    const colors = { 2:'#ffde59',3:'#ff9500',4:'#ff6eb4',5:'#a855f7' };
    el.textContent = texts[Math.min(count,5)] || `COMBO ×${count}`;
    el.style.color = colors[Math.min(count,5)] || '#ffffff';
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    Audio.playCombo(count);
    if (this.onCombo) this.onCombo(count);
  }

  // ─── Hint ────────────────────────────────────────────────────────────────

  _scheduleHint() {
    this._clearHintTimeout();
    this._hintTimeout = setTimeout(() => this._showHint(), 5000);
  }

  _clearHintTimeout() {
    if (this._hintTimeout) { clearTimeout(this._hintTimeout); this._hintTimeout = null; }
    // Clear existing hints
    document.querySelectorAll('.tile.hint').forEach(el => el.classList.remove('hint'));
  }

  _showHint() {
    // Find first valid swap and highlight it
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        for (const [tr,tc] of [[r,c+1],[r+1,c]]) {
          if (tr < ROWS && tc < COLS) {
            // Temporarily swap
            const tmp = this.grid[r][c];
            this.grid[r][c]   = this.grid[tr][tc];
            this.grid[tr][tc] = tmp;
            const m = findAllMatches(this.grid);
            this.grid[tr][tc] = this.grid[r][c];
            this.grid[r][c]   = tmp;
            if (m.length > 0) {
              this.tileEls[r][c].classList.add('hint');
              this.tileEls[tr][tc].classList.add('hint');
              setTimeout(() => {
                this.tileEls[r]?.[c]?.classList.remove('hint');
                this.tileEls[tr]?.[tc]?.classList.remove('hint');
              }, 2500);
              return;
            }
          }
        }
      }
    }
  }

  // ─── Idle wiggles ────────────────────────────────────────────────────────

  _scheduleWiggles() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = this.tileEls[r][c];
        if (el && !this.grid[r][c]?.isObstacle) {
          const delay = Math.random() * 4;
          setupWiggle(el, delay);
        }
      }
    }
  }

  // ─── Save/Load ───────────────────────────────────────────────────────────

  getState() {
    return { score: this.score, moves: this.moves };
  }
  // ─── Tutorial ────────────────────────────────────────────────────────────

  _showTutorial() {
    const hint = getHint(this.grid);
    if (!hint) return;

    const el1 = this.tileEls[hint.r1][hint.c1];
    const el2 = this.tileEls[hint.r2][hint.c2];
    if (!el1 || !el2) return;

    this.tutorialHand = document.createElement('div');
    this.tutorialHand.textContent = '👆';
    this.tutorialHand.style.cssText = `
      position: absolute;
      font-size: 3.5rem;
      z-index: 1000;
      pointer-events: none;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
      transition: all 0.8s ease-in-out;
      animation: pulse 1s infinite alternate;
    `;
    this.boardEl.appendChild(this.tutorialHand);

    const updateHandPos = () => {
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();
      const boardRect = this.boardEl.getBoundingClientRect();

      const startX = rect1.left - boardRect.left + rect1.width / 2 - 10;
      const startY = rect1.top - boardRect.top + rect1.height / 2 + 10;
      const endX = rect2.left - boardRect.left + rect2.width / 2 - 10;
      const endY = rect2.top - boardRect.top + rect2.height / 2 + 10;

      this.tutorialHand.style.transform = `translate(${startX}px, ${startY}px)`;
      
      setTimeout(() => {
        if (!this.tutorialHand) return;
        this.tutorialHand.style.transform = `translate(${endX}px, ${endY}px)`;
      }, 500);
    };

    updateHandPos();
    this.tutorialInterval = setInterval(updateHandPos, 1500);

    const removeTutorial = () => {
      if (this.tutorialHand) {
        this.tutorialHand.remove();
        this.tutorialHand = null;
        clearInterval(this.tutorialInterval);
        localStorage.setItem('tutorial_done', 'true');
      }
      this.boardEl.removeEventListener('mousedown', removeTutorial);
      this.boardEl.removeEventListener('touchstart', removeTutorial);
    };

    this.boardEl.addEventListener('mousedown', removeTutorial);
    this.boardEl.addEventListener('touchstart', removeTutorial, { passive: true });
  }

}

export default Board;
