/**
 * story.js — Story Mode Dialog System 📖
 * Simple character dialogue before/after levels
 */

// Story data per level
export const STORIES = {
  // World 1: Taman Bunga
  1: {
    world: 'Taman Bunga 🌸',
    worldBg: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
    before: [
      { char: 'mochi', text: 'Hii~ Aku Mochi! 🐱', emote: '🌸' },
      { char: 'mochi', text: 'Aku mau bikin pesta yang indah di Taman Bunga ini!', emote: '🎀' },
      { char: 'mochi', text: 'Tapi aku butuh bantuan kamu untuk match emoji! Mau bantu? 💕', emote: '🥺' },
    ],
    after: [
      { char: 'mochi', text: 'YAYYY! Kamu berhasil! 🎉', emote: '✨' },
      { char: 'mochi', text: 'Taman bunga semakin cantik~ Terima kasih! 🌺', emote: '💖' },
    ],
  },
  2: {
    world: 'Taman Bunga 🌸',
    before: [
      { char: 'mochi', text: 'Uwu masih ada bagian taman yang belum beres... 😅', emote: '🌸' },
      { char: 'mochi', text: 'Yuk match lebih banyak lagi! Semangat! 💪', emote: '⭐' },
    ],
    after: [
      { char: 'mochi', text: 'Wah kamu makin jago nih! 😍', emote: '🌟' },
      { char: 'mochi', text: 'Taman bunga sudah super cantik! Siap ke tempat berikutnya? 🌺', emote: '💕' },
    ],
  },
  3: {
    world: 'Taman Bunga 🌸',
    before: [
      { char: 'mochi', text: 'Level ini ada rintangan lho! Ada yang tidur... 😪', emote: '😰' },
      { char: 'mochi', text: 'Bikin match di sebelahnya untuk bangunin mereka! 🔨', emote: '💪' },
    ],
    after: [
      { char: 'mochi', text: 'Kamu bikin semuanya terbangun~ Hebat! ✨', emote: '🎉' },
    ],
  },
  5: {
    world: 'Pantai Bahagia 🏖️',
    before: [
      { char: 'mochi', text: 'Selamat datang di Pantai Bahagia! 🏖️', emote: '🌊' },
      { char: 'mochi', text: 'Aku punya teman baru di sini... tapi mereka butuh bantuan! 🐠', emote: '🥺' },
      { char: 'mochi', text: 'Ayo bantu ya! Party belum bisa mulai tanpa kamu~ 💕', emote: '🎀' },
    ],
    after: [
      { char: 'mochi', text: 'YEAHHH Party di pantai bisa dimulai! 🎉🏖️', emote: '🌟' },
    ],
  },
  10: {
    world: 'Kafe Manis ☕',
    before: [
      { char: 'mochi', text: 'Uwu kita sudah sampai di Kafe Manis! ☕🍰', emote: '🥰' },
      { char: 'mochi', text: 'Di sini banyak emoji manis dan kawaii~ ✨', emote: '🎀' },
      { char: 'mochi', text: 'Tapi level ini lumayan tricky lho! Siap? 😤', emote: '💪' },
    ],
    after: [
      { char: 'mochi', text: 'Kafe sudah siap bukaaaaa! 🎉 Terima kasih! 🐱💕', emote: '✨' },
    ],
  },
};

export class StorySystem {
  constructor() {
    this.overlay  = null;
    this.onFinish = null;
  }

  hasStory(levelId, type = 'before') {
    return !!(STORIES[levelId]?.[type]?.length);
  }

  showDialog(levelId, type = 'before', onFinish) {
    const story = STORIES[levelId]?.[type];
    if (!story || story.length === 0) {
      onFinish?.();
      return;
    }

    this.onFinish = onFinish;
    this._buildOverlay(story);
  }

  _buildOverlay(dialogs) {
    // Remove existing
    document.getElementById('story-overlay')?.remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'story-overlay';
    this.overlay.style.cssText = `
      position:fixed; inset:0; z-index:150;
      background:rgba(13,1,32,0.92);
      backdrop-filter:blur(8px);
      display:flex; align-items:flex-end; justify-content:center;
      padding-bottom:24px;
      animation:overlay-in 0.3s ease;
    `;

    this.overlay.innerHTML = `
      <div id="story-card" style="
        width:92%; max-width:420px;
        background:linear-gradient(160deg,rgba(80,30,100,0.98),rgba(45,11,66,0.98));
        border:1px solid rgba(255,110,180,0.25);
        border-radius:24px; padding:18px 16px 14px;
        box-shadow:0 -8px 40px rgba(255,110,180,0.2);
        animation:slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        position:relative;
      ">
        <div id="story-top" style="display:flex;gap:12px;align-items:flex-end;margin-bottom:12px">
          <div id="story-mascot" style="font-size:3.5rem;line-height:1;flex-shrink:0;animation:tile-bounce-in 0.5s ease both">🐱</div>
          <div id="story-bubble" style="
            background:rgba(255,255,255,0.07);
            border:1px solid rgba(255,180,220,0.2);
            border-radius:16px 16px 16px 4px;
            padding:10px 14px; flex:1;
            font-size:0.88rem; font-weight:600; color:white; line-height:1.5;
          "></div>
        </div>
        <div id="story-emote" style="text-align:right;font-size:1.4rem;margin-bottom:8px"></div>
        <div style="display:flex;gap:8px;align-items:center">
          <div id="story-dots" style="display:flex;gap:4px;flex:1"></div>
          <button id="story-next" style="
            background:linear-gradient(135deg,#ff6eb4,#c084fc);
            border:none; border-radius:999px; padding:9px 20px;
            font-family:Nunito,sans-serif; font-weight:800; font-size:0.85rem; color:white;
            cursor:pointer; transition:transform 0.2s;
          ">Lanjut ▶</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    let idx = 0;
    const bubbleEl = document.getElementById('story-bubble');
    const emoteEl  = document.getElementById('story-emote');
    const dotsEl   = document.getElementById('story-dots');
    const nextBtn  = document.getElementById('story-next');

    const show = (i) => {
      const d = dialogs[i];
      // Dots
      dotsEl.innerHTML = dialogs.map((_,j) =>
        `<div style="width:${j===i?'20':'8'}px;height:8px;border-radius:4px;background:${j===i?'#ff6eb4':'rgba(255,180,220,0.25)'};transition:all 0.3s"></div>`
      ).join('');
      // Text
      bubbleEl.style.animation = '';
      void bubbleEl.offsetWidth;
      bubbleEl.style.animation = 'slide-up 0.3s ease both';
      bubbleEl.textContent     = d.text;
      emoteEl.textContent      = d.emote || '';
      // Last dialog = finish button
      nextBtn.textContent = i === dialogs.length - 1 ? 'Main! 🎮' : 'Lanjut ▶';
    };

    show(0);

    nextBtn.addEventListener('click', () => {
      nextBtn.style.transform = 'scale(0.9)';
      setTimeout(() => nextBtn.style.transform = '', 150);
      idx++;
      if (idx >= dialogs.length) {
        this.overlay.style.animation = 'overlay-in 0.3s ease reverse';
        setTimeout(() => {
          this.overlay?.remove();
          this.onFinish?.();
        }, 280);
      } else {
        show(idx);
      }
    });

    // Also tap outside (skips)
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) nextBtn.click();
    });
  }

  skip() {
    this.overlay?.remove();
    this.onFinish?.();
  }
}

export default new StorySystem();
