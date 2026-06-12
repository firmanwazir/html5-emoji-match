(() => {
  // js/levels.js
  var EMOJI_NORMAL = ["\u{1F338}", "\u{1F98B}", "\u{1F380}", "\u{1F353}", "\u{1F48E}", "\u{1F319}"];
  var LEVELS = [
    {
      id: 1,
      name: "Taman Bunga",
      world: "Taman Bunga \u{1F338}",
      moves: 15,
      objectives: [
        { type: "collect", emoji: "\u{1F338}", target: 20 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [] },
      preview: "\u{1F338}",
      starThresholds: { three: 90, two: 60, one: 30 },
      story: [
        { speaker: "Mochi", text: "Halo! Aku Mochi si kucing gemas! \u{1F431}", emoji: "\u{1F431}" },
        { speaker: "Mochi", text: "Aku ingin mengadakan pesta. Bantu aku kumpulkan bunga Sakura ya! \u{1F338}", emoji: "\u2728" }
      ]
    },
    {
      id: 2,
      name: "Pita & Strawberry",
      world: "Taman Bunga \u{1F338}",
      moves: 20,
      objectives: [
        { type: "collect", emoji: "\u{1F380}", target: 15 },
        { type: "collect", emoji: "\u{1F353}", target: 15 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [] },
      preview: "\u{1F380}",
      starThresholds: { three: 90, two: 60, one: 30 }
    },
    {
      id: 3,
      name: "Rintangan Tidur",
      world: "Taman Bunga \u{1F338}",
      moves: 25,
      objectives: [
        { type: "collect", emoji: "\u{1F48E}", target: 10 }
      ],
      boardConfig: {
        emojis: EMOJI_NORMAL,
        obstacles: [{ type: "sleeping", count: 6 }]
      },
      preview: "\u{1F62A}",
      starThresholds: { three: 90, two: 60, one: 30 }
    },
    {
      id: 4,
      name: "Cahaya Bulan",
      world: "Taman Bunga \u{1F338}",
      moves: 22,
      objectives: [
        { type: "collect", emoji: "\u{1F319}", target: 18 },
        { type: "collect", emoji: "\u{1F98B}", target: 12 }
      ],
      boardConfig: {
        emojis: EMOJI_NORMAL,
        obstacles: [{ type: "angry", count: 4 }]
      },
      preview: "\u{1F319}",
      starThresholds: { three: 90, two: 60, one: 30 }
    },
    {
      id: 5,
      name: "Hati Terluka",
      world: "Pantai Bahagia \u{1F3D6}\uFE0F",
      moves: 30,
      objectives: [
        { type: "destroy", emoji: "\u{1F494}", target: 8 },
        { type: "collect", emoji: "\u{1F380}", target: 10 }
      ],
      boardConfig: {
        emojis: EMOJI_NORMAL,
        obstacles: [{ type: "crying", count: 3 }]
      },
      preview: "\u{1F494}",
      starThresholds: { three: 90, two: 60, one: 30 },
      story: [
        { speaker: "Mochi", text: "Wah, kita sampai di Pantai Bahagia! \u{1F3D6}\uFE0F", emoji: "\u{1F929}" },
        { speaker: "Mochi", text: "Tapi ada banyak hati yang terluka di sini... Ayo kita sembuhkan! \u{1F494}", emoji: "\u{1F622}" }
      ]
    },
    {
      id: 6,
      name: "Pesta Musim Semi",
      world: "Pantai Bahagia \u{1F3D6}\uFE0F",
      moves: 28,
      objectives: [
        { type: "collect", emoji: "\u{1F338}", target: 25 }
      ],
      boardConfig: {
        emojis: EMOJI_NORMAL,
        obstacles: [
          { type: "angry_strong", count: 4 },
          { type: "sleeping", count: 3 }
        ]
      },
      preview: "\u{1F338}",
      starThresholds: { three: 90, two: 60, one: 30 }
    },
    {
      id: 7,
      name: "Ombak Pantai",
      world: "Pantai Bahagia \u{1F3D6}\uFE0F",
      moves: 24,
      objectives: [
        { type: "collect", emoji: "\u{1F98B}", target: 20 },
        { type: "destroy", emoji: "\u{1F612}", target: 5 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry", count: 6 }] },
      preview: "\u{1F98B}",
      starThresholds: { three: 95, two: 65, one: 35 }
    },
    {
      id: 8,
      name: "Kerang Mutiara",
      world: "Pantai Bahagia \u{1F3D6}\uFE0F",
      moves: 30,
      objectives: [
        { type: "collect", emoji: "\u{1F48E}", target: 25 },
        { type: "collect", emoji: "\u{1F380}", target: 20 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "sleeping", count: 5 }] },
      preview: "\u{1F41A}",
      starThresholds: { three: 100, two: 70, one: 40 }
    },
    {
      id: 9,
      name: "Jejak Kelinci",
      world: "Hutan Ajaib \u{1F344}",
      moves: 26,
      objectives: [
        { type: "collect", emoji: "\u{1F353}", target: 22 },
        { type: "destroy", emoji: "\u{1F494}", target: 10 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "crying", count: 4 }] },
      preview: "\u{1F407}",
      starThresholds: { three: 90, two: 60, one: 30 },
      story: [
        { speaker: "Mochi", text: "Hutan Ajaib ini indah sekali! \u{1F344}", emoji: "\u{1F440}" },
        { speaker: "Mochi", text: "Aku melihat jejak kelinci yang lucu... mari kita ikuti! \u{1F407}", emoji: "\u{1F43E}" }
      ]
    },
    {
      id: 10,
      name: "Jamur Raksasa",
      world: "Hutan Ajaib \u{1F344}",
      moves: 32,
      objectives: [
        { type: "destroy", emoji: "\u{1F624}", target: 8 },
        { type: "collect", emoji: "\u{1F338}", target: 15 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry_strong", count: 6 }] },
      preview: "\u{1F344}",
      starThresholds: { three: 110, two: 75, one: 45 }
    },
    {
      id: 11,
      name: "Kunang-kunang",
      world: "Hutan Ajaib \u{1F344}",
      moves: 20,
      objectives: [
        { type: "collect", emoji: "\u{1F319}", target: 30 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "sleeping", count: 6 }, { type: "crying", count: 2 }] },
      preview: "\u2728",
      starThresholds: { three: 85, two: 55, one: 25 }
    },
    {
      id: 12,
      name: "Pohon Bijak",
      world: "Hutan Ajaib \u{1F344}",
      moves: 28,
      objectives: [
        { type: "collect", emoji: "\u{1F48E}", target: 15 },
        { type: "collect", emoji: "\u{1F98B}", target: 15 },
        { type: "destroy", emoji: "\u{1F612}", target: 8 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry", count: 10 }] },
      preview: "\u{1F333}",
      starThresholds: { three: 105, two: 75, one: 40 }
    },
    {
      id: 13,
      name: "Gerbang Pelangi",
      world: "Istana Awan \u2601\uFE0F",
      moves: 25,
      objectives: [
        { type: "collect", emoji: "\u{1F380}", target: 30 },
        { type: "destroy", emoji: "\u{1F624}", target: 5 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry_strong", count: 5 }, { type: "sleeping", count: 3 }] },
      preview: "\u{1F308}",
      starThresholds: { three: 100, two: 70, one: 40 },
      story: [
        { speaker: "Mochi", text: "Wow! Kita sudah sampai di Istana Awan! \u2601\uFE0F", emoji: "\u{1F632}" },
        { speaker: "Mochi", text: "Gerbang pelangi ini menghalangi jalan kita. Kita harus mencocokkan pita! \u{1F380}", emoji: "\u{1F308}" }
      ]
    },
    {
      id: 14,
      name: "Bintang Jatuh",
      world: "Istana Awan \u2601\uFE0F",
      moves: 22,
      objectives: [
        { type: "collect", emoji: "\u{1F319}", target: 20 },
        { type: "collect", emoji: "\u{1F353}", target: 20 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry", count: 8 }] },
      preview: "\u{1F320}",
      starThresholds: { three: 95, two: 65, one: 35 }
    },
    {
      id: 15,
      name: "Putri Kapas",
      world: "Istana Awan \u2601\uFE0F",
      moves: 35,
      objectives: [
        { type: "destroy", emoji: "\u{1F494}", target: 15 },
        { type: "collect", emoji: "\u{1F338}", target: 25 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "crying", count: 6 }] },
      preview: "\u{1F478}",
      starThresholds: { three: 120, two: 85, one: 50 }
    },
    {
      id: 16,
      name: "Kastil Kaca",
      world: "Istana Awan \u2601\uFE0F",
      moves: 30,
      objectives: [
        { type: "collect", emoji: "\u{1F48E}", target: 40 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry_strong", count: 8 }] },
      preview: "\u{1F3F0}",
      starThresholds: { three: 110, two: 75, one: 45 }
    },
    {
      id: 17,
      name: "Planet Permen",
      world: "Galaksi Mochi \u{1F30C}",
      moves: 28,
      objectives: [
        { type: "collect", emoji: "\u{1F353}", target: 30 },
        { type: "collect", emoji: "\u{1F380}", target: 30 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "sleeping", count: 8 }] },
      preview: "\u{1F36C}",
      starThresholds: { three: 115, two: 80, one: 45 },
      story: [
        { speaker: "Mochi", text: "Astaga! Kita terbang ke Galaksi Mochi! \u{1F30C}", emoji: "\u{1F680}" },
        { speaker: "Mochi", text: "Semuanya terbuat dari permen di planet ini! Yummy! \u{1F36C}", emoji: "\u{1F924}" }
      ]
    },
    {
      id: 18,
      name: "Orbit Ceria",
      world: "Galaksi Mochi \u{1F30C}",
      moves: 26,
      objectives: [
        { type: "destroy", emoji: "\u{1F612}", target: 12 },
        { type: "collect", emoji: "\u{1F98B}", target: 20 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry", count: 12 }] },
      preview: "\u{1F6F8}",
      starThresholds: { three: 105, two: 75, one: 40 }
    },
    {
      id: 19,
      name: "Sabuk Meteor",
      world: "Galaksi Mochi \u{1F30C}",
      moves: 32,
      objectives: [
        { type: "destroy", emoji: "\u{1F624}", target: 10 },
        { type: "destroy", emoji: "\u{1F494}", target: 8 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry_strong", count: 8 }, { type: "crying", count: 4 }] },
      preview: "\u2604\uFE0F",
      starThresholds: { three: 130, two: 95, one: 55 }
    },
    {
      id: 20,
      name: "Mochi Supernova",
      world: "Galaksi Mochi \u{1F30C}",
      moves: 40,
      objectives: [
        { type: "collect", emoji: "\u{1F338}", target: 30 },
        { type: "collect", emoji: "\u{1F48E}", target: 30 },
        { type: "collect", emoji: "\u{1F319}", target: 30 }
      ],
      boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: "angry_strong", count: 10 }, { type: "crying", count: 5 }] },
      preview: "\u{1F30C}",
      starThresholds: { three: 150, two: 110, one: 65 }
    },
    {
      id: 99,
      name: "\u{1F31F} Weekly Challenge",
      world: "Tantangan Spesial \u{1F381}",
      moves: 15,
      objectives: [
        { type: "collect", emoji: "\u{1F48E}", target: 30 },
        { type: "destroy", emoji: "\u{1F624}", target: 5 }
      ],
      boardConfig: {
        emojis: ["\u{1F338}", "\u{1F48E}", "\u{1F319}", "\u{1F380}"],
        // Fewer types = more matches!
        obstacles: [
          { type: "angry_strong", count: 5 }
        ]
      },
      preview: "\u{1F31F}",
      starThresholds: { three: 80, two: 50, one: 20 }
    }
  ];

  // js/ui.js
  function renderLevelGrid(containerEl, levels, saveData) {
    if (!containerEl) return;
    containerEl.innerHTML = "";
    for (const level of levels) {
      const stars = saveData.stars[level.id] || 0;
      const isUnlocked = level.id === 1 || (saveData.stars[level.id - 1] || 0) > 0;
      const isCompleted = stars > 0;
      const card = document.createElement("div");
      card.className = `level-card${!isUnlocked ? " locked" : ""}${isCompleted ? " completed" : ""}`;
      card.dataset.levelId = level.id;
      if (isUnlocked) {
        card.innerHTML = `
        <div class="level-num">${level.id}</div>
        <div class="level-emoji-preview">${level.preview}</div>
        <div class="level-stars">
          <span class="s ${stars >= 1 ? "earned" : ""}">\u2B50</span>
          <span class="s ${stars >= 2 ? "earned" : ""}">\u2B50</span>
          <span class="s ${stars >= 3 ? "earned" : ""}">\u2B50</span>
        </div>
      `;
        card.addEventListener("click", () => {
          window.location.href = `game.html?level=${level.id}`;
        });
      } else {
        card.innerHTML = `
        <div class="level-num" style="opacity:0.4">${level.id}</div>
        <div class="level-lock">\u{1F512}</div>
        <div class="level-stars">
          <span class="s">\u2B50</span><span class="s">\u2B50</span><span class="s">\u2B50</span>
        </div>
      `;
      }
      containerEl.appendChild(card);
    }
  }

  // js/lives.js
  var SAVE_KEY = "emoji_party_match_save";
  var MAX_LIVES = 5;
  var REGEN_MS = 30 * 60 * 1e3;
  var LivesSystem = class {
    constructor() {
      this.onLivesChange = null;
      this._timer = null;
    }
    _load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        const save = raw ? JSON.parse(raw) : {};
        return {
          lives: save.lives ?? MAX_LIVES,
          lastRegen: save.lastRegen ?? Date.now(),
          coins: save.coins ?? 0,
          boosters: save.boosters ?? { hammer: 3, bomb: 2, rocket: 2, rainbow: 1 },
          ...save
        };
      } catch {
        return this._defaultSave();
      }
    }
    _defaultSave() {
      return { lives: MAX_LIVES, lastRegen: Date.now(), coins: 0, boosters: { hammer: 3, bomb: 2, rocket: 2, rainbow: 1 } };
    }
    _save(data) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      } catch {
      }
    }
    // Regenerate lives based on elapsed time
    _regenerate(save) {
      if (save.lives >= MAX_LIVES) {
        save.lastRegen = Date.now();
        return save;
      }
      const elapsed = Date.now() - (save.lastRegen || Date.now());
      const gained = Math.floor(elapsed / REGEN_MS);
      if (gained > 0) {
        save.lives = Math.min(MAX_LIVES, save.lives + gained);
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
      const elapsed = Date.now() - (save.lastRegen || Date.now());
      const remaining = REGEN_MS - elapsed % REGEN_MS;
      return remaining;
    }
    hasLives() {
      return this.getLives() > 0;
    }
    loseLife() {
      const save = this._regenerate(this._load());
      if (save.lives > 0) {
        save.lives--;
        if (save.lives < MAX_LIVES && save.lastRegen === void 0) {
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
      }, 1e4);
    }
    stopTimer() {
      clearInterval(this._timer);
    }
    formatCountdown(ms) {
      if (!ms) return "";
      const m = Math.floor(ms / 6e4);
      const s = Math.floor(ms % 6e4 / 1e3);
      return `${m}:${s.toString().padStart(2, "0")}`;
    }
  };
  var lives_default = new LivesSystem();

  // js/daily-reward.js
  var SAVE_KEY2 = "emoji_party_match_save";
  var DAILY_KEY = "emoji_party_daily";
  var REWARDS = [
    { day: 1, type: "coins", amount: 50, label: "50 \u{1FA99}", emoji: "\u{1FA99}" },
    { day: 2, type: "booster", item: "hammer", amount: 1, label: "1\xD7 \u{1F528} Hammer", emoji: "\u{1F528}" },
    { day: 3, type: "coins", amount: 100, label: "100 \u{1FA99}", emoji: "\u{1FA99}" },
    { day: 4, type: "booster", item: "bomb", amount: 1, label: "1\xD7 \u{1F4A3} Bomb", emoji: "\u{1F4A3}" },
    { day: 5, type: "booster", item: "rocket", amount: 2, label: "2\xD7 \u{1F680} Rocket", emoji: "\u{1F680}" },
    { day: 6, type: "coins", amount: 200, label: "200 \u{1FA99}", emoji: "\u{1FA99}" },
    {
      day: 7,
      type: "jackpot",
      coins: 500,
      booster: "rainbow",
      amount: 1,
      label: "500 \u{1FA99} + \u{1F308} Rainbow!",
      emoji: "\u{1F381}"
    }
  ];
  function loadSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY2)) || {};
    } catch {
      return {};
    }
  }
  function writeSave(d) {
    try {
      localStorage.setItem(SAVE_KEY2, JSON.stringify(d));
    } catch {
    }
  }
  function loadDaily() {
    try {
      return JSON.parse(localStorage.getItem(DAILY_KEY)) || {};
    } catch {
      return {};
    }
  }
  function writeDaily(d) {
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify(d));
    } catch {
    }
  }
  function isSameDay(ts) {
    const a = new Date(ts), b = /* @__PURE__ */ new Date();
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }
  function isConsecutiveDay(ts) {
    if (!ts) return false;
    const a = new Date(ts), b = /* @__PURE__ */ new Date();
    b.setDate(b.getDate() - 1);
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }
  function getDailyStatus() {
    const daily = loadDaily();
    const claimedToday = daily.lastClaim && isSameDay(daily.lastClaim);
    const streak = daily.streak || 0;
    const dayIndex = streak % REWARDS.length;
    const nextReward = REWARDS[dayIndex];
    return {
      claimedToday,
      streak,
      dayIndex,
      nextReward,
      rewards: REWARDS
    };
  }
  function claimDailyReward() {
    const daily = loadDaily();
    const save = loadSave();
    if (daily.lastClaim && isSameDay(daily.lastClaim)) return null;
    let streak = daily.streak || 0;
    if (daily.lastClaim && !isConsecutiveDay(daily.lastClaim)) {
      streak = 0;
    }
    const reward = REWARDS[streak % REWARDS.length];
    streak++;
    if (reward.type === "coins") {
      save.coins = (save.coins || 0) + reward.amount;
    } else if (reward.type === "booster") {
      save.boosters = save.boosters || {};
      save.boosters[reward.item] = (save.boosters[reward.item] || 0) + reward.amount;
    } else if (reward.type === "jackpot") {
      save.coins = (save.coins || 0) + reward.coins;
      save.boosters = save.boosters || {};
      save.boosters[reward.booster] = (save.boosters[reward.booster] || 0) + reward.amount;
    }
    writeSave(save);
    writeDaily({ streak, lastClaim: Date.now() });
    return { reward, streak, save };
  }
  var daily_reward_default = { getDailyStatus, claimDailyReward, REWARDS };

  // js/achievements.js
  var ACHIEVEMENTS = [
    {
      id: "first_match",
      name: "First Bloom \u{1F338}",
      desc: "Selesaikan match pertamamu",
      icon: "\u{1F338}",
      rarity: "common",
      check: (stats) => (stats.totalMatches || 0) >= 1,
      reward: { coins: 30 }
    },
    {
      id: "match_100",
      name: "Match Maniac \u{1F4AB}",
      desc: "Buat 100 match",
      icon: "\u{1F4AB}",
      rarity: "uncommon",
      check: (stats) => (stats.totalMatches || 0) >= 100,
      reward: { coins: 100 }
    },
    {
      id: "combo_5",
      name: "Combo Queen \u{1F451}",
      desc: "Raih combo \xD75 untuk pertama kali",
      icon: "\u{1F451}",
      rarity: "uncommon",
      check: (stats) => (stats.maxCombo || 0) >= 5,
      reward: { coins: 80 }
    },
    {
      id: "party_first",
      name: "Party Animal \u{1F389}",
      desc: "Aktifkan Party Time pertama kali",
      icon: "\u{1F389}",
      rarity: "uncommon",
      check: (stats) => (stats.totalParties || 0) >= 1,
      reward: { coins: 60 }
    },
    {
      id: "party_10",
      name: "Party Addict \u{1F38A}",
      desc: "Aktifkan Party Time 10 kali",
      icon: "\u{1F38A}",
      rarity: "rare",
      check: (stats) => (stats.totalParties || 0) >= 10,
      reward: { coins: 200 }
    },
    {
      id: "level_5",
      name: "Level Up! \u2B50",
      desc: "Capai level 5",
      icon: "\u2B50",
      rarity: "common",
      check: (stats) => (stats.highestLevel || 0) >= 5,
      reward: { coins: 100 }
    },
    {
      id: "level_10",
      name: "Explorer \u{1F5FA}\uFE0F",
      desc: "Capai level 10",
      icon: "\u{1F5FA}\uFE0F",
      rarity: "uncommon",
      check: (stats) => (stats.highestLevel || 0) >= 10,
      reward: { coins: 200, booster: { hammer: 2 } }
    },
    {
      id: "score_50k",
      name: "Score Star \u{1F48E}",
      desc: "Raih skor 50.000 dalam satu level",
      icon: "\u{1F48E}",
      rarity: "rare",
      check: (stats) => (stats.bestScore || 0) >= 5e4,
      reward: { coins: 300 }
    },
    {
      id: "stars_10",
      name: "Star Collector \u2728",
      desc: "Kumpulkan 10 bintang",
      icon: "\u2728",
      rarity: "uncommon",
      check: (stats) => (stats.totalStars || 0) >= 10,
      reward: { coins: 150 }
    },
    {
      id: "daily_7",
      name: "Dedicated Player \u{1F98B}",
      desc: "Login 7 hari berturut-turut",
      icon: "\u{1F98B}",
      rarity: "rare",
      check: (stats) => (stats.loginStreak || 0) >= 7,
      reward: { coins: 500, booster: { rainbow: 1 } }
    },
    {
      id: "rainbow_5",
      name: "Rainbow Dream \u{1F308}",
      desc: "Aktifkan Rainbow Bomb 5 kali",
      icon: "\u{1F308}",
      rarity: "rare",
      check: (stats) => (stats.rainbowsUsed || 0) >= 5,
      reward: { coins: 250 }
    },
    {
      id: "total_score_1m",
      name: "Match Queen \u{1F478}",
      desc: "Skor total kamu mencapai 1.000.000",
      icon: "\u{1F478}",
      rarity: "legendary",
      check: (stats) => (stats.totalScore || 0) >= 1e6,
      reward: { coins: 1e3 }
    }
  ];
  var RARITY_COLORS = {
    common: { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.3)", text: "#94a3b8" },
    uncommon: { bg: "rgba(134,239,172,0.15)", border: "rgba(134,239,172,0.4)", text: "#86efac" },
    rare: { bg: "rgba(192,132,252,0.15)", border: "rgba(192,132,252,0.4)", text: "#c084fc" },
    legendary: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.4)", text: "#fbbf24" }
  };

  // js/profile.js
  var SAVE_KEY3 = "emoji_party_match_save";
  var AVATARS = ["\u{1F431}", "\u{1F430}", "\u{1F439}", "\u{1F98A}", "\u{1F43C}", "\u{1F438}", "\u{1F338}", "\u{1F98B}", "\u{1F451}", "\u{1F380}"];
  function loadSave2() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY3)) || {};
    } catch {
      return {};
    }
  }
  function writeSave2(d) {
    try {
      localStorage.setItem(SAVE_KEY3, JSON.stringify(d));
    } catch {
    }
  }
  function getProfile() {
    const save = loadSave2();
    return {
      name: save.profileName || "Player",
      avatar: save.profileAvatar || "\u{1F431}",
      stats: save.stats || {},
      achievements: save.achievements || []
    };
  }
  function setProfile(name, avatar) {
    const save = loadSave2();
    if (name) save.profileName = name.trim().substring(0, 12);
    if (avatar && AVATARS.includes(avatar)) save.profileAvatar = avatar;
    writeSave2(save);
  }
  function renderProfileModal(containerEl) {
    const p = getProfile();
    const avatarsHtml = AVATARS.map((a) => `
    <div class="avatar-option ${a === p.avatar ? "selected" : ""}" data-avatar="${a}" style="
      font-size: 2rem; cursor: pointer; padding: 4px; text-align: center;
      background: ${a === p.avatar ? "rgba(255,110,180,0.2)" : "transparent"};
      border: 2px solid ${a === p.avatar ? "#ff6eb4" : "transparent"};
      border-radius: 12px; transition: all 0.2s;
    ">${a}</div>
  `).join("");
    containerEl.innerHTML = `
    <h2 class="modal-title" style="margin-bottom:16px">\u{1F464} My Profile</h2>
    
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
      <div style="font-size:0.85rem; font-weight:800; margin-bottom:8px">\u{1F3C5} Koleksi Badge:</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px" id="prof-badges-list">
        <!-- Badges will be rendered here dynamically to avoid circular dependency if achievements.js isn't imported -->
      </div>
    </div>

    <button class="btn btn-primary w-full" id="btn-save-profile" style="padding:14px;font-size:1.1rem">
      \u{1F4BE} Simpan Profil
    </button>
  `;
    try {
      const badgesHtml = ACHIEVEMENTS.map((ach) => {
        const earned = p.achievements.includes(ach.id);
        const rc = RARITY_COLORS[ach.rarity] || RARITY_COLORS.common;
        return `
        <div class="has-tooltip" style="
          width:44px; height:44px; border-radius:12px; 
          background:${earned ? rc.bg : "rgba(0,0,0,0.3)"}; 
          border:1px solid ${earned ? rc.border : "rgba(255,255,255,0.1)"};
          display:flex; align-items:center; justify-content:center; font-size:1.5rem;
          opacity:${earned ? "1" : "0.3"}; filter:${earned ? "none" : "grayscale(100%)"};
        ">
          ${ach.icon}
          <div class="tooltip" style="width:140px;text-align:center">
            <div style="font-weight:bold;color:${rc.text};margin-bottom:4px">${ach.name}</div>
            <div style="font-size:0.75rem;color:white">${ach.desc}</div>
          </div>
        </div>
      `;
      }).join("");
      const badgesContainer = containerEl.querySelector("#prof-badges-list");
      if (badgesContainer) badgesContainer.innerHTML = badgesHtml;
    } catch (e) {
      console.error("Failed to load achievements", e);
    }
    const grid = containerEl.querySelector("#prof-avatar-grid");
    const currAv = containerEl.querySelector("#prof-curr-avatar");
    let selectedAvatar = p.avatar;
    grid.addEventListener("click", (e) => {
      const opt = e.target.closest(".avatar-option");
      if (!opt) return;
      grid.querySelectorAll(".avatar-option").forEach((el) => {
        el.classList.remove("selected");
        el.style.background = "transparent";
        el.style.border = "2px solid transparent";
      });
      opt.classList.add("selected");
      opt.style.background = "rgba(255,110,180,0.2)";
      opt.style.border = "2px solid #ff6eb4";
      selectedAvatar = opt.dataset.avatar;
      currAv.textContent = selectedAvatar;
    });
    containerEl.querySelector("#btn-save-profile").addEventListener("click", () => {
      const name = containerEl.querySelector("#prof-name-input").value;
      setProfile(name, selectedAvatar);
      const btn = containerEl.querySelector("#btn-save-profile");
      btn.textContent = "\u2705 Tersimpan!";
      btn.style.background = "#10b981";
      setTimeout(() => {
        document.getElementById("profile-overlay")?.classList.add("hidden");
      }, 500);
    });
  }
  var profile_default = { getProfile, setProfile, renderProfileModal, AVATARS };

  // js/quests.js
  var QUEST_SAVE_KEY = "emoji_party_match_quests";
  var QUEST_TEMPLATES = [
    { id: "play_levels", type: "play_level", target: 3, label: "Mainkan 3 Level", reward: { coins: 80 } },
    { id: "win_levels", type: "win_level", target: 2, label: "Menangkan 2 Level", reward: { coins: 100 } },
    { id: "make_matches", type: "match", target: 50, label: "Buat 50 Match", reward: { coins: 50 } },
    { id: "make_combos", type: "combo", target: 10, label: "Buat 10 Combo beruntun", reward: { coins: 60 } },
    { id: "party_time", type: "party", target: 3, label: "Aktifkan 3x Party Time", reward: { booster: { hammer: 1 } } },
    { id: "destroy_obs", type: "destroy", target: 20, label: "Hancurkan 20 Rintangan", reward: { coins: 120 } },
    { id: "use_rocket", type: "booster", sub: "rocket", target: 2, label: "Gunakan 2x Rocket", reward: { booster: { bomb: 1 } } }
  ];
  function loadQuests() {
    try {
      return JSON.parse(localStorage.getItem(QUEST_SAVE_KEY));
    } catch {
      return null;
    }
  }
  function writeQuests(d) {
    try {
      localStorage.setItem(QUEST_SAVE_KEY, JSON.stringify(d));
    } catch {
    }
  }
  function getTodayString() {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  function generateDailyQuests() {
    const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((q) => ({
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
  function getDailyQuests() {
    let data = loadQuests();
    if (!data || data.date !== getTodayString()) {
      data = generateDailyQuests();
    }
    return data.quests;
  }
  function addProgress(type, amount = 1, sub = null) {
    const data = loadQuests();
    if (!data || data.date !== getTodayString()) return;
    let updated = false;
    let newlyCompleted = [];
    for (const q of data.quests) {
      if (q.claimed || q.current >= q.target) continue;
      if (q.type === type && (q.sub === void 0 || q.sub === sub)) {
        q.current += amount;
        updated = true;
        if (q.current >= q.target) {
          newlyCompleted.push(q);
        }
      }
    }
    if (updated) writeQuests(data);
    return newlyCompleted;
  }
  function claimQuest(questId) {
    const data = loadQuests();
    if (!data) return false;
    const quest = data.quests.find((q) => q.id === questId);
    if (!quest || quest.claimed || quest.current < quest.target) return false;
    quest.claimed = true;
    writeQuests(data);
    const MAIN_SAVE = "emoji_party_match_save";
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
    } catch {
      return false;
    }
  }
  function renderQuestModal(containerEl) {
    const quests = getDailyQuests();
    let html = `<h2 class="modal-title" style="margin-bottom:16px">\u{1F4DC} Daily Quests</h2>`;
    quests.forEach((q) => {
      const progress = Math.min(1, q.current / q.target);
      const isComplete = q.current >= q.target;
      let rewardText = "";
      if (q.reward.coins) rewardText = `\u{1FA99} ${q.reward.coins}`;
      if (q.reward.booster) {
        const type = Object.keys(q.reward.booster)[0];
        const emoji = type === "hammer" ? "\u{1F528}" : type === "bomb" ? "\u{1F4A3}" : type === "rocket" ? "\u{1F680}" : "\u{1F308}";
        rewardText = `${emoji} ${q.reward.booster[type]}`;
      }
      html += `
      <div style="background:rgba(255,255,255,0.05); border:1px solid ${isComplete && !q.claimed ? "#ff6eb4" : "rgba(255,255,255,0.1)"}; border-radius:12px; padding:12px; margin-bottom:10px; display:flex; align-items:center; gap:12px">
        <div style="flex:1">
          <div style="font-size:0.9rem; font-weight:800; color:white; margin-bottom:4px">${q.label}</div>
          
          <div style="height:6px; background:rgba(0,0,0,0.3); border-radius:3px; overflow:hidden; margin-bottom:4px">
            <div style="height:100%; width:${progress * 100}%; background:${isComplete ? "#10b981" : "#c084fc"}; transition:width 0.3s"></div>
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700">${Math.min(q.current, q.target)} / ${q.target}</div>
        </div>
        
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
          <div style="font-size:0.75rem; font-weight:800; color:var(--gold)">${rewardText}</div>
          ${q.claimed ? `<button class="btn" style="padding:4px 12px; font-size:0.75rem; opacity:0.5" disabled>Claimed</button>` : `<button class="btn btn-${isComplete ? "gold" : "primary"} btn-claim-quest" data-id="${q.id}" style="padding:4px 12px; font-size:0.75rem" ${!isComplete ? "disabled" : ""}>
              ${isComplete ? "\u{1F381} Claim" : "\u{1F512} Lock"}
            </button>`}
        </div>
      </div>
    `;
    });
    containerEl.innerHTML = html;
    containerEl.querySelectorAll(".btn-claim-quest").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const reward = claimQuest(id);
        if (reward) {
          renderQuestModal(containerEl);
          window.dispatchEvent(new Event("coinsUpdated"));
        }
      });
    });
  }
  var quests_default = { getDailyQuests, addProgress, claimQuest, renderQuestModal };

  // js/audio.js
  var AudioEngine = class {
    constructor() {
      this._ctx = null;
      this.enabled = true;
      this._masterGain = null;
      this._initContext();
    }
    _initContext() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this._ctx = new AC();
        this._masterGain = this._ctx.createGain();
        this._masterGain.gain.value = 0.5;
        this._masterGain.connect(this._ctx.destination);
      } catch (e) {
      }
    }
    _resume() {
      if (this._ctx && this._ctx.state === "suspended") {
        this._ctx.resume();
      }
    }
    _tone(freq, type = "sine", duration = 0.15, volume = 0.3, delay = 0) {
      if (!this._ctx || !this.enabled) return;
      this._resume();
      const t = this._ctx.currentTime + delay;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(1e-3, t + duration);
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(t);
      osc.stop(t + duration);
    }
    _noise(duration = 0.1, volume = 0.2, delay = 0) {
      if (!this._ctx || !this.enabled) return;
      this._resume();
      const t = this._ctx.currentTime + delay;
      const bufferSize = this._ctx.sampleRate * duration;
      const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this._ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this._ctx.createGain();
      const filter = this._ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800;
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(1e-3, t + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this._masterGain);
      source.start(t);
    }
    // === Background Music (BGM) ===
    _playBGMStep() {
      if (!this.enabled || !this.bgmPlaying || !this._ctx) return;
      const melody = [
        261.63,
        329.63,
        392,
        523.25,
        // C
        349.23,
        440,
        523.25,
        698.46,
        // F
        392,
        493.88,
        587.33,
        783.99,
        // G
        261.63,
        329.63,
        392,
        523.25
        // C
      ];
      const freq = melody[this.bgmStep % melody.length];
      this._tone(freq, "sine", 0.2, 0.05);
      this.bgmStep++;
      this.bgmTimer = setTimeout(() => this._playBGMStep(), 250);
    }
    startBGM() {
      if (this.bgmPlaying) return;
      this.bgmPlaying = true;
      this.bgmStep = 0;
      this._resume();
      this._playBGMStep();
    }
    stopBGM() {
      this.bgmPlaying = false;
      clearTimeout(this.bgmTimer);
    }
    // === Sound effects ===
    playPop(index = 0) {
      const freq = 500 + index * 60;
      this._tone(freq, "sine", 0.12, 0.25);
      this._tone(freq * 1.5, "sine", 0.08, 0.1, 0.05);
    }
    playCombo(level = 2) {
      const notes = [523, 659, 784, 1047, 1319];
      for (let i = 0; i < Math.min(level, notes.length); i++) {
        this._tone(notes[i], "triangle", 0.2, 0.2, i * 0.07);
      }
    }
    playRocket() {
      if (!this._ctx || !this.enabled) return;
      this._resume();
      const t = this._ctx.currentTime;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.35);
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(t);
      osc.stop(t + 0.35);
    }
    playBomb() {
      this._noise(0.25, 0.4);
      this._tone(80, "sine", 0.4, 0.3, 0.02);
    }
    playRainbow() {
      const freqs = [261, 330, 392, 523, 659, 784, 1047];
      freqs.forEach((f, i) => {
        this._tone(f, "sine", 0.25, 0.2, i * 0.05);
      });
    }
    playPartyStart() {
      const melody = [523, 659, 784, 1047];
      melody.forEach((f, i) => {
        this._tone(f, "triangle", 0.25, 0.35, i * 0.1);
      });
      this._tone(1047, "triangle", 0.5, 0.4, 0.45);
      this._noise(0.1, 0.15, 0.2);
    }
    playWin() {
      const melody = [523, 659, 784, 659, 784, 1047];
      const durations = [0.15, 0.15, 0.15, 0.15, 0.15, 0.4];
      let t = 0;
      melody.forEach((f, i) => {
        this._tone(f, "triangle", durations[i], 0.3, t);
        t += durations[i] * 0.9;
      });
    }
    playLose() {
      const melody = [523, 440, 370, 294];
      melody.forEach((f, i) => {
        this._tone(f, "triangle", 0.3, 0.25, i * 0.18);
      });
    }
    playSwap() {
      this._tone(400, "sine", 0.08, 0.15);
      this._tone(350, "sine", 0.08, 0.1, 0.05);
    }
    playInvalid() {
      this._tone(180, "square", 0.1, 0.15);
      this._tone(150, "square", 0.1, 0.12, 0.1);
    }
    playBooster() {
      this._tone(784, "triangle", 0.2, 0.3);
      this._tone(1047, "triangle", 0.2, 0.25, 0.12);
    }
    playPartyTick() {
      this._tone(800 + Math.random() * 400, "sine", 0.06, 0.1);
    }
    setEnabled(val) {
      this.enabled = val;
      if (this._masterGain) {
        this._masterGain.gain.value = val ? 0.5 : 0;
      }
      if (!val) {
        this.stopBGM();
      } else {
        this.startBGM();
      }
    }
    setVolume(val) {
      if (this._masterGain) this._masterGain.gain.value = val;
    }
  };
  var Audio = new AudioEngine();
  var audio_default = Audio;

  // js/index-main.js
  var SAVE_KEY4 = "emoji_party_match_save";
  function loadSave3() {
    try {
      const save = JSON.parse(localStorage.getItem(SAVE_KEY4));
      if (!save) return defaultSave();
      if (!save.stars) save.stars = {};
      if (!save.boosters) save.boosters = { hammer: 3, bomb: 2, rocket: 2, rainbow: 1 };
      if (!save.achievements) save.achievements = [];
      return save;
    } catch {
      return defaultSave();
    }
  }
  function defaultSave() {
    return { level: 1, coins: 0, stars: {}, boosters: { hammer: 3, bomb: 2, rocket: 2, rainbow: 1 }, sound: true };
  }
  function initSparkles() {
    const container = document.querySelector(".bg-sparkles");
    if (!container) return;
    for (let i = 0; i < 50; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty("--d", `${2 + Math.random() * 5}s`);
      s.style.setProperty("--delay", `${Math.random() * 6}s`);
      s.style.setProperty("--op", `${0.3 + Math.random() * 0.7}`);
      s.style.setProperty("--sz", `${6 + Math.floor(Math.random() * 10)}px`);
      container.appendChild(s);
    }
  }
  function updateLivesUI() {
    const livesAmount = document.getElementById("lives-amount");
    const livesTooltip = document.getElementById("lives-regen-tooltip");
    if (livesAmount) livesAmount.textContent = lives_default.getLives();
    if (livesTooltip) {
      const ms = lives_default.getNextRegenMs();
      livesTooltip.textContent = ms ? `Regen in: ${lives_default.formatCountdown(ms)}` : "Full";
    }
  }
  function initDailyReward() {
    const status = daily_reward_default.getDailyStatus();
    if (!status.claimedToday) {
      const overlay = document.getElementById("daily-overlay");
      const grid = document.getElementById("daily-grid");
      const btnClaim = document.getElementById("btn-claim-daily");
      if (grid) {
        grid.innerHTML = status.rewards.map((r) => `
        <div style="background:rgba(255,255,255,0.06);border:1px solid ${r.day === status.dayIndex + 1 ? "#ff6eb4" : "rgba(255,255,255,0.1)"};border-radius:12px;padding:8px 4px;text-align:center;${r.day === 7 ? "grid-column:span 4;" : ""}">
          <div style="font-size:0.6rem;font-weight:800;color:rgba(216,180,254,0.6);margin-bottom:2px">Day ${r.day}</div>
          <div style="font-size:${r.day === 7 ? "2rem" : "1.4rem"}">${r.emoji}</div>
          <div style="font-size:0.65rem;font-weight:700;margin-top:2px">${r.label}</div>
        </div>
      `).join("");
      }
      if (overlay) overlay.classList.remove("hidden");
      if (btnClaim) {
        btnClaim.onclick = () => {
          const result = daily_reward_default.claimDailyReward();
          if (result) {
            const coinsEl = document.getElementById("coins-amount");
            if (coinsEl) coinsEl.textContent = result.save.coins.toLocaleString();
          }
          overlay?.classList.add("hidden");
        };
      }
    }
  }
  function init() {
    initSparkles();
    let saveData = loadSave3();
    const coinsEl = document.getElementById("coins-amount");
    const updateCoinsUI = () => {
      if (coinsEl) coinsEl.textContent = saveData.coins.toLocaleString();
    };
    updateCoinsUI();
    window.addEventListener("coinsUpdated", () => {
      saveData = loadSave3();
      updateCoinsUI();
    });
    updateLivesUI();
    setInterval(updateLivesUI, 1e3);
    lives_default.startTimer();
    setTimeout(initDailyReward, 600);
    const gridEl = document.getElementById("level-grid");
    renderLevelGrid(gridEl, LEVELS, saveData);
    const soundBtn = document.getElementById("sound-btn");
    audio_default.setEnabled(saveData.sound);
    const startAudioContext = () => {
      if (saveData.sound) audio_default.startBGM();
      document.removeEventListener("click", startAudioContext);
    };
    document.addEventListener("click", startAudioContext);
    if (soundBtn) {
      soundBtn.textContent = saveData.sound ? "\u{1F50A}" : "\u{1F507}";
      soundBtn.addEventListener("click", () => {
        saveData.sound = !saveData.sound;
        localStorage.setItem(SAVE_KEY4, JSON.stringify(saveData));
        soundBtn.textContent = saveData.sound ? "\u{1F50A}" : "\u{1F507}";
        audio_default.setEnabled(saveData.sound);
      });
    }
    const profileOpenBtn = document.getElementById("profile-open-btn");
    const profileOverlay = document.getElementById("profile-modal");
    if (profileOpenBtn && profileOverlay) {
      profileOpenBtn.addEventListener("click", () => {
        let content = profileOverlay.querySelector(".profile-container");
        if (!content) {
          content = document.createElement("div");
          content.className = "profile-container";
          profileOverlay.querySelector(".modal-card").appendChild(content);
        }
        profile_default.renderProfileModal(content);
        profileOverlay.classList.remove("hidden");
      });
      profileOverlay.querySelector("#profile-close-btn")?.addEventListener("click", () => {
        profileOverlay.classList.add("hidden");
      });
    }
    const questOpenBtn = document.getElementById("quest-open-btn");
    const questOverlay = document.getElementById("quest-modal");
    if (questOpenBtn && questOverlay) {
      questOpenBtn.addEventListener("click", () => {
        let content = questOverlay.querySelector(".quest-container");
        if (!content) {
          content = document.createElement("div");
          content.className = "quest-container";
          questOverlay.querySelector(".modal-card").appendChild(content);
        }
        quests_default.renderQuestModal(content);
        questOverlay.classList.remove("hidden");
      });
      questOverlay.querySelector("#quest-close-btn")?.addEventListener("click", () => {
        questOverlay.classList.add("hidden");
      });
    }
    window.addEventListener("coinsUpdated", () => {
      const freshSave = loadSave3();
      if (coinsEl) coinsEl.textContent = freshSave.coins.toLocaleString();
    });
    const floaters = document.querySelectorAll(".hero-emoji");
    floaters.forEach((el, i) => {
      el.style.animationDelay = `${i * 0.3}s`;
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
