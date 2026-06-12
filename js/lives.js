/**
 * lives.js — Heart Lives System
 * 5 lives max, 1 regenerates every 30 minutes
 */

const SAVE_KEY   = 'emoji_party_match_save';
const MAX_LIVES  = 5;
const REGEN_MS   = 30 * 60 * 1000; // 30 minutes

export class LivesSystem {
  constructor() {
    this.onLivesChange = null; // callback(current, max, nextRegenMs)
    this._timer = null;
  }

  _load() {
    try {
      const raw  = localStorage.getItem(SAVE_KEY);
      const save = raw ? JSON.parse(raw) : {};
      return {
        lives:    save.lives    ?? MAX_LIVES,
        lastRegen: save.lastRegen ?? Date.now(),
        coins:    save.coins    ?? 0,
        boosters: save.boosters ?? { hammer:3, bomb:2, rocket:2, rainbow:1 },
        ...save
      };
    } catch { return this._defaultSave(); }
  }

  _defaultSave() {
    return { lives: MAX_LIVES, lastRegen: Date.now(), coins: 0, boosters: { hammer:3, bomb:2, rocket:2, rainbow:1 } };
  }

  _save(data) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
  }

  // Regenerate lives based on elapsed time
  _regenerate(save) {
    if (save.lives >= MAX_LIVES) {
      save.lastRegen = Date.now();
      return save;
    }
    const elapsed = Date.now() - (save.lastRegen || Date.now());
    const gained  = Math.floor(elapsed / REGEN_MS);
    if (gained > 0) {
      save.lives     = Math.min(MAX_LIVES, save.lives + gained);
      save.lastRegen = save.lastRegen + gained * REGEN_MS;
    }
    return save;
  }

  getLives() {
    const save = this._regenerate(this._load());
    this._save(save);
    return save.lives;
  }

  getNextRegenMs() {
    const save = this._load();
    if (save.lives >= MAX_LIVES) return null;
    const elapsed  = Date.now() - (save.lastRegen || Date.now());
    const remaining = REGEN_MS - (elapsed % REGEN_MS);
    return remaining;
  }

  hasLives() { return this.getLives() > 0; }

  loseLife() {
    const save = this._regenerate(this._load());
    if (save.lives > 0) {
      save.lives--;
      if (save.lives < MAX_LIVES && save.lastRegen === undefined) {
        save.lastRegen = Date.now();
      }
      this._save(save);
    }
    this._notify();
    return save.lives;
  }

  addLives(n = 1) {
    const save = this._load();
    save.lives = Math.min(MAX_LIVES, (save.lives || 0) + n);
    this._save(save);
    this._notify();
  }

  buyLives(cost = 100) {
    const save = this._load();
    if ((save.coins || 0) < cost) return false;
    save.coins -= cost;
    save.lives = Math.min(MAX_LIVES, (save.lives || 0) + 5);
    this._save(save);
    this._notify();
    return true;
  }

  _notify() {
    if (this.onLivesChange) {
      const save = this._load();
      this.onLivesChange(save.lives, MAX_LIVES, this.getNextRegenMs());
    }
  }

  startTimer() {
    clearInterval(this._timer);
    this._timer = setInterval(() => {
      const save = this._regenerate(this._load());
      this._save(save);
      this._notify();
    }, 10000); // check every 10s
  }

  stopTimer() { clearInterval(this._timer); }

  formatCountdown(ms) {
    if (!ms) return '';
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2,'0')}`;
  }
}

export default new LivesSystem();
