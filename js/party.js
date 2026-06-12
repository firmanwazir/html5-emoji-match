/**
 * party.js — Party Meter & Party Time system
 */

import Audio from './audio.js';

class PartySystem {
  constructor() {
    this.meter     = 0;       // 0–100
    this.maxMeter  = 100;
    this.isParty   = false;
    this.partyDur  = 10000;   // 10 seconds
    this._timer    = null;
    this._tickInt  = null;
    this._remaining = 0;

    // UI refs set by init()
    this.fillEl    = null;
    this.pctEl     = null;
    this.overlayEl = null;
    this.bannerEl  = null;
    this.timerBarEl= null;
    this.confetti  = null;

    // Callbacks
    this.onPartyStart = null;
    this.onPartyEnd   = null;
    this.onMeterChange = null;
  }

  init({ fillEl, pctEl, overlayEl, bannerEl, timerBarEl, confetti }) {
    this.fillEl     = fillEl;
    this.pctEl      = pctEl;
    this.overlayEl  = overlayEl;
    this.bannerEl   = bannerEl;
    this.timerBarEl = timerBarEl;
    this.confetti   = confetti;
    this._updateUI();
  }

  reset() {
    this.meter   = 0;
    this.isParty = false;
    clearTimeout(this._timer);
    clearInterval(this._tickInt);
    this._endVisualParty();
    this._updateUI();
  }

  fill(amount) {
    if (this.isParty) return; // don't fill during party
    this.meter = Math.min(this.maxMeter, this.meter + amount);
    this._updateUI();
    if (this.meter >= this.maxMeter) {
      this._startParty();
    }
    if (this.onMeterChange) this.onMeterChange(this.meter);
  }

  _updateUI() {
    const pct = (this.meter / this.maxMeter) * 100;
    if (this.fillEl)  this.fillEl.style.width = `${pct}%`;
    if (this.pctEl)   this.pctEl.textContent   = `${Math.round(pct)}%`;
  }

  _startParty() {
    if (this.isParty) return;
    this.isParty = true;
    this.meter   = 0;
    this._updateUI();

    // Visual
    document.body.classList.add('party-active');
    if (this.overlayEl) this.overlayEl.classList.add('active');
    if (this.bannerEl)  {
      this.bannerEl.textContent = '🎉 PARTY TIME! 🎉';
      this.bannerEl.classList.add('show');
    }
    if (this.confetti) this.confetti.start();
    Audio.playPartyStart();

    // Party tick
    let elapsed = 0;
    this._tickInt = setInterval(() => {
      elapsed += 100;
      const frac = 1 - (elapsed / this.partyDur);
      if (this.timerBarEl) {
        this.timerBarEl.style.transform = `scaleX(${Math.max(0, frac)})`;
      }
      Audio.playPartyTick();
    }, 100);

    // End after duration
    this._timer = setTimeout(() => this._endParty(), this.partyDur);

    if (this.onPartyStart) this.onPartyStart();
  }

  _endParty() {
    this.isParty = false;
    clearInterval(this._tickInt);
    this._endVisualParty();
    if (this.onPartyEnd) this.onPartyEnd();
  }

  _endVisualParty() {
    document.body.classList.remove('party-active');
    if (this.overlayEl) this.overlayEl.classList.remove('active');
    if (this.bannerEl)  this.bannerEl.classList.remove('show');
    if (this.confetti)  this.confetti.stop();
    if (this.timerBarEl) this.timerBarEl.style.transform = 'scaleX(1)';
  }

  // Score multiplier during party
  getMultiplier() {
    return this.isParty ? 2 : 1;
  }

  // Serialise for save
  toSave() { return { meter: this.meter }; }
  fromSave(data) { this.meter = data?.meter || 0; this._updateUI(); }
}

export default PartySystem;
