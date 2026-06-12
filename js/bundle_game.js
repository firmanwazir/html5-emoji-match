(() => {
  // js/matcher.js
  var COLS = 8;
  var ROWS = 8;
  function findAllMatches(grid) {
    const matched = /* @__PURE__ */ new Set();
    const matches = [];
    for (let r = 0; r < ROWS; r++) {
      let c = 0;
      while (c < COLS) {
        const cell = grid[r][c];
        if (!cell || !isMatchable(cell)) {
          c++;
          continue;
        }
        let len = 1;
        while (c + len < COLS && grid[r][c + len]?.type === cell.type) len++;
        if (len >= 3) {
          const cells = [];
          for (let i = 0; i < len; i++) cells.push([r, c + i]);
          matches.push({ cells, orientation: "h", baseEmoji: cell.emoji, type: cell.type, count: len });
        }
        c += len;
      }
    }
    for (let c = 0; c < COLS; c++) {
      let r = 0;
      while (r < ROWS) {
        const cell = grid[r][c];
        if (!cell || !isMatchable(cell)) {
          r++;
          continue;
        }
        let len = 1;
        while (r + len < ROWS && grid[r + len][c]?.type === cell.type) len++;
        if (len >= 3) {
          const cells = [];
          for (let i = 0; i < len; i++) cells.push([r + i, c]);
          matches.push({ cells, orientation: "v", baseEmoji: cell.emoji, type: cell.type, count: len });
        }
        r += len;
      }
    }
    const result = mergeAndClassify(matches, grid);
    return result;
  }
  function mergeAndClassify(matches, grid) {
    if (matches.length === 0) return [];
    const byType = {};
    for (const m of matches) {
      if (!byType[m.type]) byType[m.type] = [];
      byType[m.type].push(m);
    }
    const result = [];
    for (const type in byType) {
      const group = byType[type];
      const allCells = /* @__PURE__ */ new Set();
      const cellList = [];
      for (const m of group) {
        for (const [r, c] of m.cells) {
          const key = `${r},${c}`;
          if (!allCells.has(key)) {
            allCells.add(key);
            cellList.push([r, c]);
          }
        }
      }
      const hMatches = group.filter((m) => m.orientation === "h");
      const vMatches = group.filter((m) => m.orientation === "v");
      let matchType = "match3";
      const totalUnique = cellList.length;
      if (hMatches.length > 0 && vMatches.length > 0) {
        const hCells = new Set(hMatches.flatMap((m) => m.cells.map((c) => `${c[0]},${c[1]}`)));
        const vCells = new Set(vMatches.flatMap((m) => m.cells.map((c) => `${c[0]},${c[1]}`)));
        const intersections = [...hCells].filter((k) => vCells.has(k));
        if (intersections.length === 1) {
          matchType = "lShape";
          if (hMatches.some((m) => m.count >= 3) && vMatches.some((m) => m.count >= 3) && totalUnique >= 5) {
            matchType = "tShape";
          }
        }
      } else {
        const maxLen = Math.max(...group.map((m) => m.count));
        if (maxLen >= 5) matchType = "match5";
        else if (maxLen === 4) matchType = "match4";
        else matchType = "match3";
      }
      result.push({
        cells: cellList,
        matchType,
        type,
        emoji: grid[cellList[0][0]][cellList[0][1]]?.emoji,
        pivotCell: cellList[Math.floor(cellList.length / 2)]
        // center for special spawn
      });
    }
    return result;
  }
  function isMatchable(cell) {
    if (!cell) return false;
    if (cell.isObstacle) return false;
    if (cell.type === "rocket" || cell.type === "bomb" || cell.type === "rainbow") return false;
    return true;
  }
  function wouldMatch(grid, r, c, type) {
    const left1 = c >= 1 ? grid[r][c - 1]?.type : null;
    const left2 = c >= 2 ? grid[r][c - 2]?.type : null;
    const right1 = c < COLS - 1 ? grid[r][c + 1]?.type : null;
    const right2 = c < COLS - 2 ? grid[r][c + 2]?.type : null;
    if (left1 === type && left2 === type) return true;
    if (left1 === type && right1 === type) return true;
    if (right1 === type && right2 === type) return true;
    const up1 = r >= 1 ? grid[r - 1][c]?.type : null;
    const up2 = r >= 2 ? grid[r - 2][c]?.type : null;
    const down1 = r < ROWS - 1 ? grid[r + 1][c]?.type : null;
    const down2 = r < ROWS - 2 ? grid[r + 2][c]?.type : null;
    if (up1 === type && up2 === type) return true;
    if (up1 === type && down1 === type) return true;
    if (down1 === type && down2 === type) return true;
    return false;
  }
  function hasAnyValidMove(grid) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (c < COLS - 1) {
          swapCells(grid, r, c, r, c + 1);
          const m = findAllMatches(grid);
          swapCells(grid, r, c, r, c + 1);
          if (m.length > 0) return true;
        }
        if (r < ROWS - 1) {
          swapCells(grid, r, c, r + 1, c);
          const m = findAllMatches(grid);
          swapCells(grid, r, c, r + 1, c);
          if (m.length > 0) return true;
        }
      }
    }
    return false;
  }
  function swapCells(grid, r1, c1, r2, c2) {
    const tmp = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = tmp;
  }
  function getAdjacentCells(r, c) {
    const adj = [];
    if (r > 0) adj.push([r - 1, c]);
    if (r < ROWS - 1) adj.push([r + 1, c]);
    if (c > 0) adj.push([r, c - 1]);
    if (c < COLS - 1) adj.push([r, c + 1]);
    return adj;
  }
  function getHint(grid) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!isMatchable(grid[r][c])) continue;
        if (c < COLS - 1 && isMatchable(grid[r][c + 1])) {
          swapCells(grid, r, c, r, c + 1);
          const m = findAllMatches(grid);
          swapCells(grid, r, c, r, c + 1);
          if (m.length > 0) return { r1: r, c1: c, r2: r, c2: c + 1 };
        }
        if (r < ROWS - 1 && isMatchable(grid[r + 1][c])) {
          swapCells(grid, r, c, r + 1, c);
          const m = findAllMatches(grid);
          swapCells(grid, r, c, r + 1, c);
          if (m.length > 0) return { r1: r, c1: c, r2: r + 1, c2: c };
        }
      }
    }
    return null;
  }

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
  var SCORE_TABLE = {
    match3: 30,
    match4: 60,
    match5: 100,
    lShape: 80,
    tShape: 80,
    rocket: 50,
    bomb: 80,
    rainbow: 120
  };
  var PARTY_FILL = {
    match3: 5,
    match4: 10,
    match5: 15,
    bomb: 20,
    rocket: 12,
    rainbow: 25
  };
  var COMBO_MULT = { 1: 1, 2: 1.2, 3: 1.5, 4: 2, 5: 2 };

  // js/animator.js
  var ConfettiSystem = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = [];
      this.running = false;
      this.raf = null;
      this._resize();
      window.addEventListener("resize", () => this._resize());
    }
    _resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    _spawn(count = 15) {
      const colors = ["#ff6eb4", "#ffde59", "#7ef9ff", "#a855f7", "#ff9500", "#86efac", "#f0abfc"];
      const shapes = ["rect", "circle", "star"];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: -15,
          vx: (Math.random() - 0.5) * 7,
          vy: 2.5 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.25,
          w: 7 + Math.random() * 12,
          h: 4 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          life: 1,
          decay: 4e-3 + Math.random() * 7e-3,
          wobble: Math.random() * Math.PI * 2,
          wobbleV: 0.05 + Math.random() * 0.08
        });
      }
    }
    _drawStar(ctx, cx, cy, r) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = i * 4 * Math.PI / 5 - Math.PI / 2, a2 = (i * 4 + 2) * Math.PI / 5 - Math.PI / 2;
        i === 0 ? ctx.moveTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1)) : ctx.lineTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1));
        ctx.lineTo(cx + r / 2 * Math.cos(a2), cy + r / 2 * Math.sin(a2));
      }
      ctx.closePath();
      ctx.fill();
    }
    _draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.wobble += p.wobbleV;
        p.x += p.vx + Math.sin(p.wobble) * 1.5;
        p.y += p.vy;
        p.rot += p.rotV;
        p.life -= p.decay;
        if (p.y > this.canvas.height + 20 || p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "star") {
          this._drawStar(ctx, 0, 0, p.w / 2);
        } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    _loop() {
      this._draw();
      if (this.running || this.particles.length > 0) this.raf = requestAnimationFrame(() => this._loop());
      else {
        this.canvas.classList.remove("active");
        this.raf = null;
      }
    }
    start() {
      this.running = true;
      this.canvas.classList.add("active");
      this._spawn(25);
      clearInterval(this._int);
      this._int = setInterval(() => {
        if (this.running) this._spawn(12);
      }, 300);
      if (!this.raf) this._loop();
    }
    stop() {
      this.running = false;
      clearInterval(this._int);
      setTimeout(() => {
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.classList.remove("active");
        if (this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = null;
        }
      }, 2500);
    }
    burst(x, y, count = 14) {
      const colors = ["#ff6eb4", "#ffde59", "#7ef9ff", "#a855f7", "#ff9500"];
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * 2 * i / count + Math.random() * 0.6, speed = 4 + Math.random() * 6;
        this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3, rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.4, w: 5 + Math.random() * 9, h: 4 + Math.random() * 7, color: colors[Math.floor(Math.random() * colors.length)], shape: Math.random() > 0.5 ? "rect" : "circle", life: 1, decay: 0.02 + Math.random() * 0.025, wobble: 0, wobbleV: 0 });
      }
      if (!this.raf) {
        this.canvas.classList.add("active");
        this._loop();
      }
    }
  };
  async function animateSwapFromOldPos(el1, el2, rect1, rect2) {
    const cur1 = el1.getBoundingClientRect();
    const cur2 = el2.getBoundingClientRect();
    const dx1 = rect2.left - cur1.left;
    const dy1 = rect2.top - cur1.top;
    const dx2 = rect1.left - cur2.left;
    const dy2 = rect1.top - cur2.top;
    const dur = 260;
    const ease = "cubic-bezier(0.34,1.56,0.64,1)";
    el1.style.transition = "none";
    el2.style.transition = "none";
    el1.style.zIndex = "20";
    el2.style.zIndex = "20";
    el1.style.transform = `translate(${dx1}px,${dy1}px) scale(1.08)`;
    el2.style.transform = `translate(${dx2}px,${dy2}px) scale(1.08)`;
    void el1.offsetWidth;
    el1.style.transition = `transform ${dur}ms ${ease}`;
    el2.style.transition = `transform ${dur}ms ${ease}`;
    el1.style.transform = "scale(1)";
    el2.style.transform = "scale(1)";
    await new Promise((r) => setTimeout(r, dur + 20));
    el1.style.transition = "";
    el2.style.transition = "";
    el1.style.transform = "";
    el2.style.transform = "";
    el1.style.zIndex = "";
    el2.style.zIndex = "";
  }
  async function animateInvalidBump(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const dx = r2.left - r1.left;
    const dy = r2.top - r1.top;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const bx = dx / mag * 14;
    const by = dy / mag * 14;
    const dur1 = 130, dur2 = 180;
    el1.style.transition = `transform ${dur1}ms ease-out`;
    el2.style.transition = `transform ${dur1}ms ease-out`;
    el1.style.transform = `translate(${bx}px,${by}px) scale(0.92)`;
    el2.style.transform = `translate(${-bx}px,${-by}px) scale(0.92)`;
    await new Promise((r) => setTimeout(r, dur1));
    el1.style.transition = `transform ${dur2}ms cubic-bezier(0.34,1.56,0.64,1)`;
    el2.style.transition = `transform ${dur2}ms cubic-bezier(0.34,1.56,0.64,1)`;
    el1.style.transform = "";
    el2.style.transform = "";
    await new Promise((r) => setTimeout(r, dur2));
    el1.style.transition = "";
    el2.style.transition = "";
    el1.classList.add("invalid-swap");
    el2.classList.add("invalid-swap");
    setTimeout(() => {
      el1?.classList.remove("invalid-swap");
      el2?.classList.remove("invalid-swap");
    }, 450);
  }
  function popTiles(elements) {
    if (!elements || elements.length === 0) return Promise.resolve();
    const validEls = elements.filter(Boolean);
    const maxStagger = Math.min(validEls.length * 40, 180);
    return new Promise((resolve) => {
      validEls.forEach((el, i) => {
        const delay = i / Math.max(validEls.length - 1, 1) * maxStagger;
        setTimeout(() => {
          if (!el || !el.isConnected) return;
          el.style.transition = "transform 0.12s ease-out, filter 0.12s";
          el.style.transform = "scale(1.4)";
          el.style.filter = "brightness(2) saturate(2) drop-shadow(0 0 8px gold)";
          el.style.zIndex = "20";
          spawnMatchSparkles(el);
          setTimeout(() => {
            if (!el || !el.isConnected) return;
            el.style.transition = "transform 0.18s cubic-bezier(0.55,0,1,0.45), opacity 0.18s ease-in, filter 0.1s";
            el.style.transform = "scale(0) rotate(25deg)";
            el.style.opacity = "0";
            el.style.filter = "";
          }, 120);
        }, delay);
      });
      const totalTime = maxStagger + 120 + 200;
      setTimeout(() => {
        validEls.forEach((el) => {
          if (!el) return;
          el.style.transition = "";
          el.style.transform = "";
          el.style.opacity = "";
          el.style.filter = "";
          el.style.zIndex = "";
        });
        resolve();
      }, totalTime);
    });
  }
  function spawnMatchSparkles(tileEl) {
    const rect = tileEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ["#ffde59", "#ff6eb4", "#7ef9ff", "#a855f7", "#ffffff", "#ff9500"];
    for (let i = 0; i < 7; i++) {
      const star = document.createElement("div");
      const angle = Math.PI * 2 * i / 7;
      const dist = 18 + Math.random() * 24;
      star.style.cssText = `
      position:fixed; pointer-events:none; z-index:100;
      left:${cx}px; top:${cy}px;
      width:${4 + Math.random() * 5}px; height:${4 + Math.random() * 5}px;
      border-radius:50%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      box-shadow:0 0 6px currentColor;
      transform:translate(-50%,-50%);
      animation:sparkle-pop ${0.4 + Math.random() * 0.25}s ease-out ${Math.random() * 60}ms forwards;
      --tx:${Math.cos(angle) * dist}px; --ty:${Math.sin(angle) * dist}px;
    `;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 800);
    }
  }
  function spawnBombRing(x, y) {
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div");
      ring.style.cssText = `
      position:fixed; pointer-events:none; z-index:80;
      left:${x}px; top:${y}px;
      width:60px; height:60px;
      border:${3 - i}px solid rgba(${i === 0 ? "255,107,107" : i === 1 ? "255,222,89" : "168,85,247"},${0.9 - i * 0.2});
      border-radius:50%; transform:translate(-50%,-50%);
      animation:bomb-ring ${0.45 + i * 0.1}s ease-out ${i * 80}ms forwards;
    `;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 800);
    }
    screenShake();
  }
  function spawnRocketTrail(x1, y1, x2, y2, isRow) {
    const trail = document.createElement("div");
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    trail.style.cssText = `
    position:fixed; pointer-events:none; z-index:80;
    left:${Math.min(x1, x2)}px; top:${Math.min(y1, y2) - 1}px;
    width:${isRow ? w : 4}px; height:${isRow ? 4 : h}px;
    background:linear-gradient(${isRow ? "90deg" : "180deg"}, transparent, #ff9500, #ffde59, transparent);
    border-radius:2px;
    animation:rocket-sweep 0.4s ease-out forwards;
    transform-origin:${isRow ? "left" : "top"} center;
  `;
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 500);
  }
  function spawnRainbowFlash() {
    const el = document.createElement("div");
    el.style.cssText = `
    position:fixed; inset:0; pointer-events:none; z-index:70;
    background:linear-gradient(135deg,rgba(255,110,180,.3),rgba(168,85,247,.3),rgba(126,249,255,.3),rgba(255,222,89,.3));
    animation:rainbow-wave-flash 0.7s ease forwards;
  `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }
  function screenShake() {
    const el = document.getElementById("game-screen") || document.body;
    el.classList.remove("screen-shake");
    void el.offsetWidth;
    el.classList.add("screen-shake");
    setTimeout(() => el.classList.remove("screen-shake"), 450);
  }
  function bounceIn(el, delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!el || !el.isConnected) {
          resolve();
          return;
        }
        el.style.animation = "";
        void el.offsetWidth;
        el.style.animation = "tile-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both";
        setTimeout(() => {
          if (el) el.style.animation = "";
          resolve();
        }, 500);
      }, delay);
    });
  }
  function fallIn(el, delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!el || !el.isConnected) {
          resolve();
          return;
        }
        el.style.animation = "";
        void el.offsetWidth;
        el.style.animation = "tile-fall-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both";
        setTimeout(() => {
          if (el) el.style.animation = "";
          resolve();
        }, 420);
      }, delay);
    });
  }
  function showFloatingScore(x, y, text, color = "#ffde59", isBig = false) {
    const el = document.createElement("div");
    el.style.cssText = `
    position:fixed; pointer-events:none; z-index:90;
    left:${x}px; top:${y}px;
    font-family:'Nunito',sans-serif;
    font-size:${isBig ? "1.5" : "1.05"}rem; font-weight:900; color:${color};
    text-shadow:0 0 12px ${color}, 0 2px 8px rgba(0,0,0,.6);
    transform:translateX(-50%);
    animation:float-up ${isBig ? "1.3" : "1.0"}s ease forwards;
    white-space:nowrap;
  `;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
  function setupWiggle(el, delay = 0) {
    const dur = 2.2 + Math.random() * 2.5;
    el.style.setProperty("--wiggle-d", `${dur}s`);
    el.style.setProperty("--wiggle-delay", `${delay}s`);
    el.classList.add("wiggle-idle");
  }

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

  // js/party.js
  var PartySystem = class {
    constructor() {
      this.meter = 0;
      this.maxMeter = 100;
      this.isParty = false;
      this.partyDur = 1e4;
      this._timer = null;
      this._tickInt = null;
      this._remaining = 0;
      this.fillEl = null;
      this.pctEl = null;
      this.overlayEl = null;
      this.bannerEl = null;
      this.timerBarEl = null;
      this.confetti = null;
      this.onPartyStart = null;
      this.onPartyEnd = null;
      this.onMeterChange = null;
    }
    init({ fillEl, pctEl, overlayEl, bannerEl, timerBarEl, confetti }) {
      this.fillEl = fillEl;
      this.pctEl = pctEl;
      this.overlayEl = overlayEl;
      this.bannerEl = bannerEl;
      this.timerBarEl = timerBarEl;
      this.confetti = confetti;
      this._updateUI();
    }
    reset() {
      this.meter = 0;
      this.isParty = false;
      clearTimeout(this._timer);
      clearInterval(this._tickInt);
      this._endVisualParty();
      this._updateUI();
    }
    fill(amount) {
      if (this.isParty) return;
      this.meter = Math.min(this.maxMeter, this.meter + amount);
      this._updateUI();
      if (this.meter >= this.maxMeter) {
        this._startParty();
      }
      if (this.onMeterChange) this.onMeterChange(this.meter);
    }
    _updateUI() {
      const pct = this.meter / this.maxMeter * 100;
      if (this.fillEl) this.fillEl.style.width = `${pct}%`;
      if (this.pctEl) this.pctEl.textContent = `${Math.round(pct)}%`;
    }
    _startParty() {
      if (this.isParty) return;
      this.isParty = true;
      this.meter = 0;
      this._updateUI();
      document.body.classList.add("party-active");
      if (this.overlayEl) this.overlayEl.classList.add("active");
      if (this.bannerEl) {
        this.bannerEl.textContent = "\u{1F389} PARTY TIME! \u{1F389}";
        this.bannerEl.classList.add("show");
      }
      if (this.confetti) this.confetti.start();
      audio_default.playPartyStart();
      let elapsed = 0;
      this._tickInt = setInterval(() => {
        elapsed += 100;
        const frac = 1 - elapsed / this.partyDur;
        if (this.timerBarEl) {
          this.timerBarEl.style.transform = `scaleX(${Math.max(0, frac)})`;
        }
        audio_default.playPartyTick();
      }, 100);
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
      document.body.classList.remove("party-active");
      if (this.overlayEl) this.overlayEl.classList.remove("active");
      if (this.bannerEl) this.bannerEl.classList.remove("show");
      if (this.confetti) this.confetti.stop();
      if (this.timerBarEl) this.timerBarEl.style.transform = "scaleX(1)";
    }
    // Score multiplier during party
    getMultiplier() {
      return this.isParty ? 2 : 1;
    }
    // Serialise for save
    toSave() {
      return { meter: this.meter };
    }
    fromSave(data) {
      this.meter = data?.meter || 0;
      this._updateUI();
    }
  };
  var party_default = PartySystem;

  // js/board.js
  var Board = class {
    constructor() {
      this.grid = [];
      this.tileEls = [];
      this.boardEl = null;
      this.level = null;
      this.score = 0;
      this.moves = 0;
      this.comboCount = 0;
      this.selectedCell = null;
      this.inputLocked = false;
      this.hammerMode = false;
      this.objectives = [];
      this.party = null;
      this.confetti = null;
      this.onScoreChange = null;
      this.onMovesChange = null;
      this.onObjectiveUpdate = null;
      this.onWin = null;
      this.onLose = null;
      this.onCombo = null;
      this._touchStart = null;
      this._cryingTimer = 0;
      this._hintTimeout = null;
    }
    // ─── Init ────────────────────────────────────────────────────────────────
    init(boardEl, level, party) {
      this.boardEl = boardEl;
      this.level = level;
      this.party = party;
      this.score = 0;
      this.moves = level.moves;
      this.comboCount = 0;
      this.inputLocked = false;
      this._cryingTimer = 0;
      this.objectives = level.objectives.map((o) => ({
        ...o,
        current: 0
      }));
      this._buildGrid(level);
      this._renderBoard();
      this._scheduleWiggles();
      if (this.level.id === 1 && !localStorage.getItem("tutorial_done")) {
        setTimeout(() => this._showTutorial(), 1500);
      }
    }
    // ─── Grid Building ───────────────────────────────────────────────────────
    _buildGrid(level) {
      const cfg = level.boardConfig;
      this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
      const obstaclePositions = [];
      for (const obs of cfg.obstacles) {
        let placed = 0;
        let attempts = 0;
        while (placed < obs.count && attempts < 100) {
          const r = Math.floor(Math.random() * ROWS);
          const c = Math.floor(Math.random() * COLS);
          if (!this.grid[r][c]) {
            this.grid[r][c] = this._makeObstacleTile(obs.type, r, c);
            obstaclePositions.push([r, c]);
            placed++;
          }
          attempts++;
        }
      }
      const emojis = cfg.emojis;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (this.grid[r][c]) continue;
          let type, emoji;
          let tries = 0;
          do {
            const idx = Math.floor(Math.random() * emojis.length);
            emoji = emojis[idx];
            type = this._emojiToType(emoji);
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
        case "angry":
          return { type: "angry", emoji: "\u{1F612}", isObstacle: true, hp: 1 };
        case "angry_strong":
          return { type: "angry_strong", emoji: "\u{1F624}", isObstacle: true, hp: 2 };
        case "sleeping":
          return { type: "sleeping", emoji: "\u{1F62A}", isObstacle: true, hp: 1 };
        case "crying":
          return { type: "crying", emoji: "\u{1F494}", isObstacle: true, hp: 1, spreadTimer: 3 };
        default:
          return { type: obsType, emoji: "\u2753", isObstacle: true, hp: 1 };
      }
    }
    _makeSpecialTile(specialType) {
      const map = { rocket: "\u{1F680}", bomb: "\u{1F4A3}", rainbow: "\u{1F308}" };
      return { type: specialType, emoji: map[specialType], isObstacle: false, isSpecial: true, hp: null };
    }
    _emojiToType(emoji) {
      const map = {
        "\u{1F431}": "cat",
        "\u{1F430}": "rabbit",
        "\u{1F439}": "hamster",
        "\u{1F98A}": "fox",
        "\u{1F43C}": "panda",
        "\u{1F438}": "frog"
      };
      return map[emoji] || emoji;
    }
    _randomNormalTile() {
      const emojis = this.level.boardConfig.emojis;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      return this._makeNormalTile(this._emojiToType(emoji), emoji);
    }
    // ─── Render ──────────────────────────────────────────────────────────────
    _renderBoard() {
      this.boardEl.innerHTML = "";
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
      const el = document.createElement("div");
      el.className = "tile";
      el.dataset.r = r;
      el.dataset.c = c;
      el.dataset.type = cell.type;
      const inner = document.createElement("span");
      inner.className = "emoji-inner";
      inner.textContent = cell.emoji;
      el.appendChild(inner);
      if (cell.isObstacle && cell.hp > 1) {
        const hp = document.createElement("span");
        hp.className = "tile-hp";
        hp.textContent = `\xD7${cell.hp}`;
        el.appendChild(hp);
      }
      setTimeout(() => bounceIn(el, (r * COLS + c) * 15), 50);
      return el;
    }
    _updateTileEl(r, c) {
      const cell = this.grid[r][c];
      const el = this.tileEls[r][c];
      if (!el || !cell) return;
      el.dataset.type = cell.type;
      const inner = el.querySelector(".emoji-inner");
      if (inner) inner.textContent = cell.emoji;
      let hpEl = el.querySelector(".tile-hp");
      if (cell.isObstacle && cell.hp > 1) {
        if (!hpEl) {
          hpEl = document.createElement("span");
          hpEl.className = "tile-hp";
          el.appendChild(hpEl);
        }
        hpEl.textContent = `\xD7${cell.hp}`;
      } else if (hpEl) hpEl.remove();
    }
    // ─── Events ──────────────────────────────────────────────────────────────
    _attachBoardEvents() {
      const el = this.boardEl;
      el.addEventListener("mousedown", (e) => this._onPointerDown(e));
      el.addEventListener("mouseup", (e) => this._onPointerUp(e));
      el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this._onPointerDown(e.touches[0]);
      }, { passive: false });
      el.addEventListener("touchend", (e) => {
        e.preventDefault();
        this._onPointerUp(e.changedTouches[0]);
      }, { passive: false });
      el.addEventListener("touchmove", (e) => {
        e.preventDefault();
      }, { passive: false });
    }
    _getTileFromPoint(x, y) {
      const el = document.elementFromPoint(x, y);
      const tile = el?.closest?.(".tile");
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
      if (!hit) {
        this._touchStart = null;
        return;
      }
      const start = this._touchStart;
      this._touchStart = null;
      if (this.hammerMode) {
        this._applyHammer(hit.r, hit.c);
        return;
      }
      if (start.r === hit.r && start.c === hit.c) {
        this._handleTap(hit.r, hit.c, hit.el);
      } else {
        const dr = hit.r - start.r;
        const dc = hit.c - start.c;
        const absDr = Math.abs(dr), absDc = Math.abs(dc);
        let targetR = start.r, targetC = start.c;
        if (absDr > absDc) targetR += dr > 0 ? 1 : -1;
        else targetC += dc > 0 ? 1 : -1;
        if (targetR >= 0 && targetR < ROWS && targetC >= 0 && targetC < COLS) {
          this._deselect();
          this._trySwap(start.r, start.c, targetR, targetC);
        }
      }
    }
    _handleTap(r, c, el) {
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
      el.classList.add("selected");
      audio_default.playSwap();
    }
    _deselect() {
      if (this.selectedCell) {
        this.selectedCell.el.classList.remove("selected");
        this.selectedCell = null;
      }
    }
    // ─── Swap & Match Loop ───────────────────────────────────────────────────
    async _trySwap(r1, c1, r2, c2) {
      if (this.inputLocked) return;
      const cell1 = this.grid[r1][c1];
      const cell2 = this.grid[r2][c2];
      if (cell1?.isObstacle && cell2?.isObstacle) {
        audio_default.playInvalid();
        return;
      }
      this.inputLocked = true;
      this._clearHintTimeout();
      const el1 = this.tileEls[r1][c1];
      const el2 = this.tileEls[r2][c2];
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();
      if (cell1?.type === "rainbow" || cell2?.type === "rainbow") {
        const rainbowR = cell1?.type === "rainbow" ? r1 : r2;
        const rainbowC = cell1?.type === "rainbow" ? c1 : c2;
        const targetR = cell1?.type === "rainbow" ? r2 : r1;
        const targetC = cell1?.type === "rainbow" ? c2 : c1;
        this.grid[r1][c1] = cell2;
        this.grid[r2][c2] = cell1;
        this._updateTileEl(r1, c1);
        this._updateTileEl(r2, c2);
        await animateSwapFromOldPos(el1, el2, rect1, rect2);
        await this._activateRainbow(rainbowR, rainbowC, targetR, targetC);
        this._decrementMoves();
        await this._applyGravity();
        const cm = findAllMatches(this.grid);
        if (cm.length > 0) await this._resolveMatches(cm, false);
        this.inputLocked = false;
        this._scheduleHint();
        if (this._checkWin()) return;
        if (this.moves <= 0) {
          this._handleLose();
          return;
        }
        return;
      }
      this.grid[r1][c1] = cell2;
      this.grid[r2][c2] = cell1;
      const matches = findAllMatches(this.grid);
      if (matches.length === 0) {
        this.grid[r1][c1] = cell1;
        this.grid[r2][c2] = cell2;
        await animateInvalidBump(el1, el2);
        audio_default.playInvalid();
        this.inputLocked = false;
        this._scheduleHint();
        return;
      }
      this._updateTileEl(r1, c1);
      this._updateTileEl(r2, c2);
      await animateSwapFromOldPos(el1, el2, rect1, rect2);
      audio_default.playSwap();
      this._decrementMoves();
      this.comboCount = 0;
      await this._resolveMatches(matches);
      this.inputLocked = false;
      this._scheduleHint();
      if (this._checkWin()) return;
      if (this.moves <= 0) {
        this._handleLose();
        return;
      }
      if (!hasAnyValidMove(this.grid)) {
        this._shuffleBoard();
      }
    }
    // ─── Match Resolution ────────────────────────────────────────────────────
    async _resolveMatches(matches, isChain = false) {
      if (matches.length === 0) return;
      if (isChain) {
        this.comboCount++;
        if (this.comboCount >= 2) this._showCombo(this.comboCount);
      }
      const mult = COMBO_MULT[Math.min(this.comboCount || 1, 5)] * this.party.getMultiplier();
      const toDestroy = /* @__PURE__ */ new Set();
      const specialSpawns = [];
      for (const match of matches) {
        for (const [r, c] of match.cells) {
          toDestroy.add(`${r},${c}`);
        }
        let specialType = null;
        if (match.matchType === "match5") specialType = "rainbow";
        else if (match.matchType === "match4") specialType = "rocket";
        else if (match.matchType === "lShape" || match.matchType === "tShape") specialType = "bomb";
        if (specialType) {
          specialSpawns.push({ specialType, pivot: match.pivotCell });
        }
        const baseScore = SCORE_TABLE[match.matchType] || 30;
        const pts = Math.round(baseScore * mult);
        this.score += pts;
        const partyFill = PARTY_FILL[match.matchType] || 5;
        this.party.fill(partyFill);
        this._updateObjectives(match);
        audio_default.playPop(this.comboCount);
        const [pr, pc] = match.cells[0];
        const el = this.tileEls[pr][pc];
        if (el) {
          const rect = el.getBoundingClientRect();
          const color = this.party.isParty ? "var(--pink)" : "var(--gold)";
          showFloatingScore(rect.left + rect.width / 2, rect.top, `+${pts}`, color, this.comboCount >= 2);
        }
      }
      const popEls = [];
      for (const key of toDestroy) {
        const [r, c] = key.split(",").map(Number);
        if (this.tileEls[r][c]) popEls.push(this.tileEls[r][c]);
      }
      await popTiles(popEls);
      for (const key of toDestroy) {
        const [r, c] = key.split(",").map(Number);
        const adj = getAdjacentCells(r, c);
        for (const [ar, ac] of adj) {
          const cell = this.grid[ar][ac];
          if (cell?.isObstacle && !toDestroy.has(`${ar},${ac}`)) {
            await this._damageObstacle(ar, ac, r, c);
          }
        }
      }
      for (const key of toDestroy) {
        const [r, c] = key.split(",").map(Number);
        this.grid[r][c] = null;
      }
      for (const { specialType, pivot } of specialSpawns) {
        const [pr, pc] = pivot;
        if (this.grid[pr][pc] === null) {
          this.grid[pr][pc] = this._makeSpecialTile(specialType);
        }
      }
      if (this.onScoreChange) this.onScoreChange(this.score);
      await this._applyGravity();
      const chainMatches = findAllMatches(this.grid);
      if (chainMatches.length > 0) {
        await this._resolveMatches(chainMatches, true);
      }
      this._cryingTimer++;
      if (this._cryingTimer >= 3) {
        this._cryingTimer = 0;
        this._spreadCrying();
      }
    }
    async _applyGravity() {
      let moved = false;
      for (let c = 0; c < COLS; c++) {
        let writeR = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (this.grid[r][c] !== null) {
            if (r !== writeR) {
              this.grid[writeR][c] = this.grid[r][c];
              this.grid[r][c] = null;
              moved = true;
            }
            writeR--;
          }
        }
        for (let r = writeR; r >= 0; r--) {
          this.grid[r][c] = this._randomNormalTile();
          moved = true;
        }
      }
      this._rerenderAll(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    _rerenderAll(animate = false) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const el = this.tileEls[r][c];
          const cell = this.grid[r][c];
          if (!el || !cell) continue;
          el.dataset.type = cell.type;
          const inner = el.querySelector(".emoji-inner");
          if (inner) inner.textContent = cell.emoji;
          const hp = el.querySelector(".tile-hp");
          if (hp) hp.remove();
          if (cell.isObstacle && cell.hp > 1) {
            const hpEl = document.createElement("span");
            hpEl.className = "tile-hp";
            hpEl.textContent = `\xD7${cell.hp}`;
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
        await popTiles([el]);
        this.grid[r][c] = null;
        this._updateObjectivesDestroy(cell.type);
        if (this.onObstacleDestroy) this.onObstacleDestroy(cell.type);
        if (this.confetti) {
          const rect = el.getBoundingClientRect();
          this.confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
        }
      } else {
        el.classList.add("invalid-swap");
        setTimeout(() => el.classList.remove("invalid-swap"), 450);
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
      if (cell.type === "rocket") await this._activateRocket(r, c);
      if (cell.type === "bomb") await this._activateBomb(r, c);
      if (cell.type === "rainbow") {
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
      audio_default.playRocket();
      this.party.fill(PARTY_FILL.rocket);
      this.grid[r][c] = null;
      const clearRow = Math.random() > 0.5;
      const toDestroy = [];
      if (clearRow) {
        for (let cc = 0; cc < COLS; cc++) toDestroy.push([r, cc]);
      } else {
        for (let rr = 0; rr < ROWS; rr++) toDestroy.push([rr, c]);
      }
      const firstEl = this.tileEls[toDestroy[0][0]][toDestroy[0][1]];
      const lastEl = this.tileEls[toDestroy[toDestroy.length - 1][0]][toDestroy[toDestroy.length - 1][1]];
      if (firstEl && lastEl) {
        const r1 = firstEl.getBoundingClientRect();
        const r2 = lastEl.getBoundingClientRect();
        spawnRocketTrail(r1.left, r1.top + r1.height / 2, r2.right, r2.top + r2.height / 2, clearRow);
      }
      const pts = SCORE_TABLE.rocket * this.party.getMultiplier();
      this.score += pts;
      if (this.onScoreChange) this.onScoreChange(this.score);
      const els = toDestroy.map(([rr, cc]) => this.tileEls[rr][cc]).filter(Boolean);
      await popTiles(els);
      for (const [rr, cc] of toDestroy) this.grid[rr][cc] = null;
    }
    async _activateBomb(r, c) {
      audio_default.playBomb();
      this.party.fill(PARTY_FILL.bomb);
      const pts = SCORE_TABLE.bomb * this.party.getMultiplier();
      this.score += pts;
      if (this.onScoreChange) this.onScoreChange(this.score);
      const bombEl = this.tileEls[r][c];
      if (bombEl) {
        const rect = bombEl.getBoundingClientRect();
        spawnBombRing(rect.left + rect.width / 2, rect.top + rect.height / 2);
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
      const els = toDestroy.map(([rr, cc]) => this.tileEls[rr][cc]).filter(Boolean);
      await popTiles(els);
      for (const [rr, cc] of toDestroy) this.grid[rr][cc] = null;
      if (this.confetti) {
        const rect2 = this.tileEls[r]?.[c]?.getBoundingClientRect?.();
        if (rect2) this.confetti.burst(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2, 20);
      }
    }
    async _activateRainbow(rr, cc, targetR, targetC) {
      audio_default.playRainbow();
      this.party.fill(PARTY_FILL.rainbow);
      spawnRainbowFlash();
      const targetType = this.grid[targetR][targetC]?.type;
      if (targetType) {
        await this._clearAllOfType(targetType);
      }
      const elsToPop = [];
      if (this.grid[rr][cc]) elsToPop.push(this.tileEls[rr][cc]);
      if (this.grid[targetR][targetC] && this.grid[targetR][targetC].type !== targetType) {
        elsToPop.push(this.tileEls[targetR][targetC]);
      }
      if (elsToPop.length > 0) await popTiles(elsToPop);
      this.grid[rr][cc] = null;
      this.grid[targetR][targetC] = null;
    }
    async _clearAllOfType(type) {
      const toDestroy = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (this.grid[r][c]?.type === type) toDestroy.push([r, c]);
        }
      }
      const pts = SCORE_TABLE.rainbow * this.party.getMultiplier();
      this.score += Math.round(pts);
      if (this.onScoreChange) this.onScoreChange(this.score);
      const els = toDestroy.map(([r, c]) => this.tileEls[r][c]).filter(Boolean);
      await popTiles(els);
      for (const [r, c] of toDestroy) this.grid[r][c] = null;
    }
    // ─── Boosters ────────────────────────────────────────────────────────────
    enableHammer() {
      this.hammerMode = true;
      document.body.classList.add("hammer-mode");
    }
    disableHammer() {
      this.hammerMode = false;
      document.body.classList.remove("hammer-mode");
    }
    async _applyHammer(r, c) {
      this.disableHammer();
      audio_default.playBomb();
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
      const positions = [];
      for (let r2 = 0; r2 < ROWS; r2++)
        for (let c2 = 0; c2 < COLS; c2++)
          if (!this.grid[r2][c2]?.isObstacle && !this.grid[r2][c2]?.isSpecial)
            positions.push([r2, c2]);
      if (positions.length === 0) return;
      const [r, c] = positions[Math.floor(Math.random() * positions.length)];
      this.grid[r][c] = this._makeSpecialTile("bomb");
      this._updateTileEl(r, c);
      audio_default.playBooster();
      bounceIn(this.tileEls[r][c]);
    }
    async placeRocketBooster() {
      const positions = [];
      for (let r2 = 0; r2 < ROWS; r2++)
        for (let c2 = 0; c2 < COLS; c2++)
          if (!this.grid[r2][c2]?.isObstacle && !this.grid[r2][c2]?.isSpecial)
            positions.push([r2, c2]);
      if (positions.length === 0) return;
      const [r, c] = positions[Math.floor(Math.random() * positions.length)];
      this.grid[r][c] = this._makeSpecialTile("rocket");
      this._updateTileEl(r, c);
      audio_default.playBooster();
      bounceIn(this.tileEls[r][c]);
    }
    async placeRainbowBooster() {
      const positions = [];
      for (let r2 = 0; r2 < ROWS; r2++)
        for (let c2 = 0; c2 < COLS; c2++)
          if (!this.grid[r2][c2]?.isObstacle && !this.grid[r2][c2]?.isSpecial)
            positions.push([r2, c2]);
      if (positions.length === 0) return;
      const [r, c] = positions[Math.floor(Math.random() * positions.length)];
      this.grid[r][c] = this._makeSpecialTile("rainbow");
      this._updateTileEl(r, c);
      audio_default.playBooster();
      bounceIn(this.tileEls[r][c]);
    }
    // ─── Objectives ──────────────────────────────────────────────────────────
    _updateObjectives(match) {
      for (const obj of this.objectives) {
        if (obj.type === "collect") {
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
        if (obj.type === "destroy") {
          const typeMap = { angry: "\u{1F621}", angry_strong: "\u{1F620}", sleeping: "\u{1F634}", crying: "\u{1F62D}" };
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
      const allDone = this.objectives.every((o) => o.current >= o.target);
      if (allDone) {
        setTimeout(() => {
          audio_default.playWin();
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
        audio_default.playLose();
        if (this.onLose) this.onLose(this.score, this.objectives);
      }, 400);
    }
    // ─── Crying Spread ───────────────────────────────────────────────────────
    _spreadCrying() {
      const crying = [];
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (this.grid[r][c]?.type === "crying") crying.push([r, c]);
      for (const [r, c] of crying) {
        const adj = getAdjacentCells(r, c);
        const empty = adj.filter(([ar, ac]) => this.grid[ar][ac] && !this.grid[ar][ac].isObstacle && !this.grid[ar][ac].isSpecial);
        if (empty.length > 0) {
          const [tr, tc] = empty[Math.floor(Math.random() * empty.length)];
          this.grid[tr][tc] = { type: "crying", emoji: "\u{1F62D}", isObstacle: true, hp: 1 };
          this._updateTileEl(tr, tc);
          fallIn(this.tileEls[tr][tc]);
        }
      }
    }
    // ─── Board Shuffle (deadlock) ─────────────────────────────────────────────
    _shuffleBoard() {
      const positions = [];
      const tiles = [];
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (this.grid[r][c] && !this.grid[r][c].isObstacle && !this.grid[r][c].isSpecial) {
            positions.push([r, c]);
            tiles.push(this.grid[r][c]);
          }
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
      tiles.forEach((t, i) => {
        const [r, c] = positions[i];
        this.grid[r][c] = t;
      });
      this._rerenderAll(true);
    }
    // ─── Combo display ───────────────────────────────────────────────────────
    _showCombo(count) {
      const el = document.getElementById("combo-display");
      if (!el) return;
      const texts = { 2: "NICE! \xD72", 3: "GREAT! \xD73", 4: "AMAZING! \xD74", 5: "\u{1F389} PARTY BONUS!" };
      const colors = { 2: "#ffde59", 3: "#ff9500", 4: "#ff6eb4", 5: "#a855f7" };
      el.textContent = texts[Math.min(count, 5)] || `COMBO \xD7${count}`;
      el.style.color = colors[Math.min(count, 5)] || "#ffffff";
      el.classList.remove("show");
      void el.offsetWidth;
      el.classList.add("show");
      audio_default.playCombo(count);
      if (this.onCombo) this.onCombo(count);
    }
    // ─── Hint ────────────────────────────────────────────────────────────────
    _scheduleHint() {
      this._clearHintTimeout();
      this._hintTimeout = setTimeout(() => this._showHint(), 5e3);
    }
    _clearHintTimeout() {
      if (this._hintTimeout) {
        clearTimeout(this._hintTimeout);
        this._hintTimeout = null;
      }
      document.querySelectorAll(".tile.hint").forEach((el) => el.classList.remove("hint"));
    }
    _showHint() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          for (const [tr, tc] of [[r, c + 1], [r + 1, c]]) {
            if (tr < ROWS && tc < COLS) {
              const tmp = this.grid[r][c];
              this.grid[r][c] = this.grid[tr][tc];
              this.grid[tr][tc] = tmp;
              const m = findAllMatches(this.grid);
              this.grid[tr][tc] = this.grid[r][c];
              this.grid[r][c] = tmp;
              if (m.length > 0) {
                this.tileEls[r][c].classList.add("hint");
                this.tileEls[tr][tc].classList.add("hint");
                setTimeout(() => {
                  this.tileEls[r]?.[c]?.classList.remove("hint");
                  this.tileEls[tr]?.[tc]?.classList.remove("hint");
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
      this.tutorialHand = document.createElement("div");
      this.tutorialHand.textContent = "\u{1F446}";
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
          localStorage.setItem("tutorial_done", "true");
        }
        this.boardEl.removeEventListener("mousedown", removeTutorial);
        this.boardEl.removeEventListener("touchstart", removeTutorial);
      };
      this.boardEl.addEventListener("mousedown", removeTutorial);
      this.boardEl.addEventListener("touchstart", removeTutorial, { passive: true });
    }
  };
  var board_default = Board;

  // js/ui.js
  function updateScore(el, score) {
    if (!el) return;
    el.textContent = score.toLocaleString();
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
    setTimeout(() => el.classList.remove("pulse"), 400);
  }
  function updateMoves(el, moves) {
    if (!el) return;
    el.textContent = moves;
    if (moves <= 5) el.style.color = "var(--red)";
    else if (moves <= 10) el.style.color = "var(--gold)";
    else el.style.color = "";
  }
  function renderGoals(containerEl, objectives) {
    if (!containerEl) return;
    containerEl.innerHTML = "";
    const label = document.createElement("span");
    label.className = "goal-label";
    label.textContent = "Goal:";
    containerEl.appendChild(label);
    for (const obj of objectives) {
      const item = document.createElement("div");
      item.className = `goal-item${obj.current >= obj.target ? " done" : ""}`;
      item.innerHTML = `
      <span class="emoji">${obj.emoji}</span>
      <span class="count">${obj.current}/${obj.target}</span>
      ${obj.current >= obj.target ? '<span class="check">\u2713</span>' : ""}
    `;
      containerEl.appendChild(item);
    }
  }
  function calcStars(objectives, thresholds) {
    const total = objectives.reduce((s, o) => s + o.target, 0);
    const current = objectives.reduce((s, o) => s + Math.min(o.current, o.target), 0);
    const pct = total > 0 ? current / total * 100 : 0;
    if (pct >= thresholds.three) return 3;
    if (pct >= thresholds.two) return 2;
    if (pct >= thresholds.one) return 1;
    return 0;
  }
  function updateBoosterBtn(btn, count) {
    if (!btn) return;
    const countEl = btn.querySelector(".booster-count");
    if (countEl) countEl.textContent = count;
    if (count <= 0) btn.classList.add("depleted");
    else btn.classList.remove("depleted");
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

  // js/mascot.js
  var REACTIONS = {
    idle: { anim: "idle", msg: ["Ayo main! \u2728", "Semangat! \u{1F4AA}", "Kamu bisa! \u{1F338}"] },
    happy: { anim: "happy", msg: ["Yay~! \u{1F338}", "Nice one! \u2728", "Bagus! \u{1F380}", "Good job! \u{1F495}"] },
    excited: { anim: "excited", msg: ["COMBO! \u26A1", "Amazing! \u{1F525}", "Super! \u{1F4AB}", "Keren banget! \u2728"] },
    veryExcited: { anim: "veryExcited", msg: ["INCREDIBLE!! \u{1F389}", "WOW WOW WOW! \u{1F929}", "SUPER COMBO! \u26A1\u{1F4AB}"] },
    party: { anim: "party", msg: ["PARTY TIME~! \u{1F389}", "Yes yes yes! \u{1F38A}", "Yeahhh! \u{1F380}"] },
    sad: { anim: "sad", msg: ["Ups... \u{1F622}", "Jangan menyerah! \u{1F495}", "Coba lagi yuk~ \u{1F338}"] },
    surprised: { anim: "surprised", msg: ["Woah! \u{1F62E}", "Keren! \u2728", "Luar biasa! \u{1F48E}"] },
    win: { anim: "win", msg: ["MENANG! \u{1F3C6}", "Kamu the best! \u{1F451}", "Sempurna! \u{1F31F}"] },
    love: { anim: "love", msg: ["Uwu~ \u{1F496}", "So cute! \u{1FA77}", "Love it! \u{1F49D}"] }
  };
  var MOCHI_SVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="mochi-svg">
  <!-- Body -->
  <ellipse cx="60" cy="72" rx="35" ry="30" fill="#fff0f8"/>
  <!-- Head -->
  <circle cx="60" cy="48" r="36" fill="#fff0f8"/>
  <!-- Left ear -->
  <ellipse cx="32" cy="20" rx="10" ry="14" fill="#fff0f8" transform="rotate(-15,32,20)"/>
  <ellipse cx="32" cy="20" rx="5" ry="8" fill="#ffb3d9" transform="rotate(-15,32,20)"/>
  <!-- Right ear -->
  <ellipse cx="88" cy="20" rx="10" ry="14" fill="#fff0f8" transform="rotate(15,88,20)"/>
  <ellipse cx="88" cy="20" rx="5" ry="8" fill="#ffb3d9" transform="rotate(15,88,20)"/>
  <!-- Eye left -->
  <g class="mochi-eye-l">
    <ellipse cx="46" cy="46" rx="8" ry="9" fill="#3d1a4a"/>
    <circle cx="49" cy="43" r="3" fill="white"/>
    <circle cx="43" cy="50" r="1.5" fill="white"/>
  </g>
  <!-- Eye right -->
  <g class="mochi-eye-r">
    <ellipse cx="74" cy="46" rx="8" ry="9" fill="#3d1a4a"/>
    <circle cx="77" cy="43" r="3" fill="white"/>
    <circle cx="71" cy="50" r="1.5" fill="white"/>
  </g>
  <!-- Nose -->
  <ellipse cx="60" cy="56" rx="4" ry="3" fill="#ffb3d9"/>
  <!-- Mouth -->
  <path d="M54 60 Q60 66 66 60" stroke="#c084fc" stroke-width="2.5" fill="none" stroke-linecap="round" class="mochi-mouth"/>
  <!-- Cheeks -->
  <circle cx="35" cy="58" r="8" fill="rgba(255,110,180,0.2)" class="mochi-cheek"/>
  <circle cx="85" cy="58" r="8" fill="rgba(255,110,180,0.2)" class="mochi-cheek"/>
  <!-- Whiskers left -->
  <line x1="18" y1="55" x2="40" y2="57" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="18" y1="60" x2="40" y2="60" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <!-- Whiskers right -->
  <line x1="102" y1="55" x2="80" y2="57" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="102" y1="60" x2="80" y2="60" stroke="#d4a0d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <!-- Bow tie -->
  <path d="M50 88 L55 93 L50 98 L60 93 L70 98 L65 93 L70 88 L60 93 Z" fill="#ff6eb4" class="mochi-bow"/>
  <!-- Paw left -->
  <ellipse cx="30" cy="100" rx="12" ry="10" fill="#fff0f8"/>
  <circle cx="24" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="30" cy="97" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="36" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <!-- Paw right -->
  <ellipse cx="90" cy="100" rx="12" ry="10" fill="#fff0f8"/>
  <circle cx="84" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="90" cy="97" r="3.5" fill="#ffb3d9" opacity="0.6"/>
  <circle cx="96" cy="99" r="3.5" fill="#ffb3d9" opacity="0.6"/>
</svg>`;
  var MascotSystem = class {
    constructor() {
      this.container = null;
      this.svgEl = null;
      this.bubbleEl = null;
      this.msgTimeout = null;
      this.idleTimeout = null;
      this.currentState = "idle";
    }
    mount(containerId = "mascot-container") {
      this.container = document.getElementById(containerId);
      if (!this.container) return;
      this.container.innerHTML = `
      <div id="mascot-wrap">
        <div id="mascot-bubble" class="mascot-bubble hidden"></div>
        <div id="mascot-body" class="mascot-body idle">${MOCHI_SVG}</div>
      </div>
    `;
      this.svgEl = this.container.querySelector(".mochi-svg");
      this.bubbleEl = document.getElementById("mascot-bubble");
      this.bodyEl = document.getElementById("mascot-body");
      this.bodyEl.addEventListener("click", () => this.react("love"));
      this._scheduleIdleMessage();
    }
    react(state, overrideMsg = null) {
      const reaction = REACTIONS[state] || REACTIONS.idle;
      const msg = overrideMsg || reaction.msg[Math.floor(Math.random() * reaction.msg.length)];
      this.currentState = state;
      if (this.bodyEl) {
        this.bodyEl.className = `mascot-body ${state}`;
        clearTimeout(this._returnTimer);
        if (state !== "idle" && state !== "party") {
          this._returnTimer = setTimeout(() => {
            if (this.bodyEl) this.bodyEl.className = "mascot-body idle";
          }, 2200);
        }
      }
      this._showBubble(msg);
      this._scheduleIdleMessage();
    }
    _showBubble(msg) {
      if (!this.bubbleEl) return;
      clearTimeout(this.msgTimeout);
      this.bubbleEl.textContent = msg;
      this.bubbleEl.classList.remove("hidden");
      this.bubbleEl.style.animation = "";
      void this.bubbleEl.offsetWidth;
      this.bubbleEl.style.animation = "bubble-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both";
      this.msgTimeout = setTimeout(() => {
        if (this.bubbleEl) {
          this.bubbleEl.style.animation = "bubble-fade 0.3s ease forwards";
          setTimeout(() => this.bubbleEl?.classList.add("hidden"), 320);
        }
      }, 2500);
    }
    _scheduleIdleMessage() {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = setTimeout(() => {
        if (this.currentState === "idle") {
          const msgs = REACTIONS.idle.msg;
          this._showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
        }
        this._scheduleIdleMessage();
      }, 8e3 + Math.random() * 6e3);
    }
    setPartyMode(active) {
      if (active) this.react("party");
      else {
        this.currentState = "idle";
        if (this.bodyEl) this.bodyEl.className = "mascot-body idle";
      }
    }
  };
  var mascot_default = new MascotSystem();

  // js/achievements.js
  var SAVE_KEY2 = "emoji_party_match_save";
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
  function checkAchievements(onUnlock) {
    const save = loadSave();
    const stats = save.stats || {};
    const earned = save.achievements || [];
    const newlyEarned = [];
    for (const ach of ACHIEVEMENTS) {
      if (earned.includes(ach.id)) continue;
      if (ach.check(stats)) {
        earned.push(ach.id);
        newlyEarned.push(ach);
        if (ach.reward.coins) save.coins = (save.coins || 0) + ach.reward.coins;
        if (ach.reward.booster) {
          save.boosters = save.boosters || {};
          for (const [k, v] of Object.entries(ach.reward.booster)) {
            save.boosters[k] = (save.boosters[k] || 0) + v;
          }
        }
      }
    }
    if (newlyEarned.length > 0) {
      save.achievements = earned;
      writeSave(save);
      newlyEarned.forEach((a) => onUnlock && onUnlock(a));
    }
    return newlyEarned;
  }
  function updateStats(updates) {
    const save = loadSave();
    save.stats = save.stats || {};
    for (const [k, v] of Object.entries(updates)) {
      if (k === "totalMatches" || k === "totalParties" || k === "rainbowsUsed") {
        save.stats[k] = (save.stats[k] || 0) + v;
      } else if (k === "maxCombo" || k === "highestLevel" || k === "bestScore") {
        save.stats[k] = Math.max(save.stats[k] || 0, v);
      } else if (k === "totalScore" || k === "totalStars") {
        save.stats[k] = (save.stats[k] || 0) + v;
      } else {
        save.stats[k] = v;
      }
    }
    writeSave(save);
    return save.stats;
  }
  function showAchievementToast(achievement) {
    const rc = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
    const el = document.createElement("div");
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
      <div style="font-weight:900;font-size:0.85rem;color:white">\u{1FA99}+${achievement.reward.coins || 0}</div>
    </div>
  `;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.animation = "slide-up 0.3s ease forwards";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 350);
    }, 4e3);
  }

  // js/story.js
  var STORIES = {
    // World 1: Taman Bunga
    1: {
      world: "Taman Bunga \u{1F338}",
      worldBg: "linear-gradient(135deg, #fce7f3, #fdf2f8)",
      before: [
        { char: "mochi", text: "Hii~ Aku Mochi! \u{1F431}", emote: "\u{1F338}" },
        { char: "mochi", text: "Aku mau bikin pesta yang indah di Taman Bunga ini!", emote: "\u{1F380}" },
        { char: "mochi", text: "Tapi aku butuh bantuan kamu untuk match emoji! Mau bantu? \u{1F495}", emote: "\u{1F97A}" }
      ],
      after: [
        { char: "mochi", text: "YAYYY! Kamu berhasil! \u{1F389}", emote: "\u2728" },
        { char: "mochi", text: "Taman bunga semakin cantik~ Terima kasih! \u{1F33A}", emote: "\u{1F496}" }
      ]
    },
    2: {
      world: "Taman Bunga \u{1F338}",
      before: [
        { char: "mochi", text: "Uwu masih ada bagian taman yang belum beres... \u{1F605}", emote: "\u{1F338}" },
        { char: "mochi", text: "Yuk match lebih banyak lagi! Semangat! \u{1F4AA}", emote: "\u2B50" }
      ],
      after: [
        { char: "mochi", text: "Wah kamu makin jago nih! \u{1F60D}", emote: "\u{1F31F}" },
        { char: "mochi", text: "Taman bunga sudah super cantik! Siap ke tempat berikutnya? \u{1F33A}", emote: "\u{1F495}" }
      ]
    },
    3: {
      world: "Taman Bunga \u{1F338}",
      before: [
        { char: "mochi", text: "Level ini ada rintangan lho! Ada yang tidur... \u{1F62A}", emote: "\u{1F630}" },
        { char: "mochi", text: "Bikin match di sebelahnya untuk bangunin mereka! \u{1F528}", emote: "\u{1F4AA}" }
      ],
      after: [
        { char: "mochi", text: "Kamu bikin semuanya terbangun~ Hebat! \u2728", emote: "\u{1F389}" }
      ]
    },
    5: {
      world: "Pantai Bahagia \u{1F3D6}\uFE0F",
      before: [
        { char: "mochi", text: "Selamat datang di Pantai Bahagia! \u{1F3D6}\uFE0F", emote: "\u{1F30A}" },
        { char: "mochi", text: "Aku punya teman baru di sini... tapi mereka butuh bantuan! \u{1F420}", emote: "\u{1F97A}" },
        { char: "mochi", text: "Ayo bantu ya! Party belum bisa mulai tanpa kamu~ \u{1F495}", emote: "\u{1F380}" }
      ],
      after: [
        { char: "mochi", text: "YEAHHH Party di pantai bisa dimulai! \u{1F389}\u{1F3D6}\uFE0F", emote: "\u{1F31F}" }
      ]
    },
    10: {
      world: "Kafe Manis \u2615",
      before: [
        { char: "mochi", text: "Uwu kita sudah sampai di Kafe Manis! \u2615\u{1F370}", emote: "\u{1F970}" },
        { char: "mochi", text: "Di sini banyak emoji manis dan kawaii~ \u2728", emote: "\u{1F380}" },
        { char: "mochi", text: "Tapi level ini lumayan tricky lho! Siap? \u{1F624}", emote: "\u{1F4AA}" }
      ],
      after: [
        { char: "mochi", text: "Kafe sudah siap bukaaaaa! \u{1F389} Terima kasih! \u{1F431}\u{1F495}", emote: "\u2728" }
      ]
    }
  };
  var StorySystem = class {
    constructor() {
      this.overlay = null;
      this.onFinish = null;
    }
    hasStory(levelId, type = "before") {
      return !!STORIES[levelId]?.[type]?.length;
    }
    showDialog(levelId, type = "before", onFinish) {
      const story = STORIES[levelId]?.[type];
      if (!story || story.length === 0) {
        onFinish?.();
        return;
      }
      this.onFinish = onFinish;
      this._buildOverlay(story);
    }
    _buildOverlay(dialogs) {
      document.getElementById("story-overlay")?.remove();
      this.overlay = document.createElement("div");
      this.overlay.id = "story-overlay";
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
          <div id="story-mascot" style="font-size:3.5rem;line-height:1;flex-shrink:0;animation:tile-bounce-in 0.5s ease both">\u{1F431}</div>
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
          ">Lanjut \u25B6</button>
        </div>
      </div>
    `;
      document.body.appendChild(this.overlay);
      let idx = 0;
      const bubbleEl = document.getElementById("story-bubble");
      const emoteEl = document.getElementById("story-emote");
      const dotsEl = document.getElementById("story-dots");
      const nextBtn = document.getElementById("story-next");
      const show = (i) => {
        const d = dialogs[i];
        dotsEl.innerHTML = dialogs.map(
          (_, j) => `<div style="width:${j === i ? "20" : "8"}px;height:8px;border-radius:4px;background:${j === i ? "#ff6eb4" : "rgba(255,180,220,0.25)"};transition:all 0.3s"></div>`
        ).join("");
        bubbleEl.style.animation = "";
        void bubbleEl.offsetWidth;
        bubbleEl.style.animation = "slide-up 0.3s ease both";
        bubbleEl.textContent = d.text;
        emoteEl.textContent = d.emote || "";
        nextBtn.textContent = i === dialogs.length - 1 ? "Main! \u{1F3AE}" : "Lanjut \u25B6";
      };
      show(0);
      nextBtn.addEventListener("click", () => {
        nextBtn.style.transform = "scale(0.9)";
        setTimeout(() => nextBtn.style.transform = "", 150);
        idx++;
        if (idx >= dialogs.length) {
          this.overlay.style.animation = "overlay-in 0.3s ease reverse";
          setTimeout(() => {
            this.overlay?.remove();
            this.onFinish?.();
          }, 280);
        } else {
          show(idx);
        }
      });
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) nextBtn.click();
      });
    }
    skip() {
      this.overlay?.remove();
      this.onFinish?.();
    }
  };
  var story_default = new StorySystem();

  // js/share.js
  async function generateShareCard({ score, stars, level, levelName = "" }) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, "#2d0b42");
    bg.addColorStop(0.4, "#4a1560");
    bg.addColorStop(1, "#1a0428");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const orb1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 320);
    orb1.addColorStop(0, "rgba(253,164,207,0.4)");
    orb1.addColorStop(1, "transparent");
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const orb2 = ctx.createRadialGradient(930, 930, 0, 930, 930, 350);
    orb2.addColorStop(0, "rgba(192,132,252,0.35)");
    orb2.addColorStop(1, "transparent");
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,110,180,0.12)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(540, 540, (i + 1) * 90, 0, Math.PI * 2);
      ctx.stroke();
    }
    const decorEmojis = ["\u{1F338}", "\u2728", "\u{1F495}", "\u{1F31F}", "\u{1F380}", "\u{1F4AB}", "\u{1F33A}"];
    ctx.font = "48px serif";
    const positions = [[100, 120], [980, 80], [60, 960], [1010, 940], [160, 540], [950, 540], [540, 80], [540, 980]];
    positions.forEach(([x, y], i) => {
      ctx.globalAlpha = 0.4;
      ctx.fillText(decorEmojis[i % decorEmojis.length], x - 24, y + 16);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.font = "bold 52px Nunito, sans-serif";
    const grad1 = ctx.createLinearGradient(300, 200, 780, 200);
    grad1.addColorStop(0, "#ff6eb4");
    grad1.addColorStop(0.5, "#fda4cf");
    grad1.addColorStop(1, "#c084fc");
    ctx.fillStyle = grad1;
    ctx.fillText("\u{1F389} Emoji Party Match", 540, 200);
    ctx.font = "600 34px Nunito, sans-serif";
    ctx.fillStyle = "rgba(240,171,252,0.7)";
    ctx.fillText(`Level ${level}${levelName ? ` \u2014 ${levelName}` : ""}`, 540, 260);
    const cardRadius = 40;
    const cardX = 140, cardY = 300, cardW = 800, cardH = 440;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,110,180,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "700 36px Nunito, sans-serif";
    ctx.fillStyle = "rgba(240,171,252,0.6)";
    ctx.fillText("SCORE", 540, 380);
    const scoreGrad = ctx.createLinearGradient(300, 400, 780, 530);
    scoreGrad.addColorStop(0, "#fbbf24");
    scoreGrad.addColorStop(0.5, "#fef08a");
    scoreGrad.addColorStop(1, "#fda4cf");
    ctx.font = "bold 130px Nunito, sans-serif";
    ctx.fillStyle = scoreGrad;
    ctx.shadowColor = "rgba(251,191,36,0.5)";
    ctx.shadowBlur = 40;
    ctx.fillText(score.toLocaleString(), 540, 510);
    ctx.shadowBlur = 0;
    const starCount = 3;
    const starSpacing = 80;
    const starX = 540 - (starCount - 1) / 2 * starSpacing;
    ctx.font = "60px serif";
    for (let i = 0; i < starCount; i++) {
      ctx.globalAlpha = i < stars ? 1 : 0.2;
      ctx.fillText("\u2B50", starX + i * starSpacing - 30, 620);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,110,180,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 680);
    ctx.lineTo(880, 680);
    ctx.stroke();
    ctx.font = "600 30px Nunito, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText("\u2728 Aku dapat skor ini di Emoji Party Match! \u2728", 540, 740);
    ctx.font = "bold 28px Nunito, sans-serif";
    const ctaGrad = ctx.createLinearGradient(300, 770, 780, 800);
    ctaGrad.addColorStop(0, "#ff6eb4");
    ctaGrad.addColorStop(1, "#c084fc");
    ctx.fillStyle = ctaGrad;
    ctx.fillText("\u{1F431} Yuk main bareng! \u{1F431}", 540, 800);
    ctx.font = "100px serif";
    ctx.fillText("\u{1F431}", 540, 940);
    ctx.font = "900 22px Nunito, sans-serif";
    ctx.fillStyle = "rgba(255,110,180,0.4)";
    ctx.textAlign = "right";
    ctx.fillText("\u{1F380} Emoji Party Match", 1020, 1050);
    return canvas;
  }
  async function shareScore(data) {
    const canvas = await generateShareCard(data);
    if (navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], "emoji-party-match-score.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "Emoji Party Match",
              text: `\u{1F389} Aku dapat skor ${data.score.toLocaleString()} di Level ${data.level}! Yuk main bareng! \u{1F431}`,
              files: [file]
            });
            return;
          }
        });
        return;
      } catch {
      }
    }
    const link = document.createElement("a");
    link.download = "emoji-party-match-score.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

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

  // js/main.js
  var SAVE_KEY3 = "emoji_party_match_save";
  function loadSave2() {
    try {
      const save = JSON.parse(localStorage.getItem(SAVE_KEY3));
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
    return {
      level: 1,
      coins: 0,
      stars: {},
      boosters: { hammer: 3, bomb: 2, rocket: 2, rainbow: 1 },
      sound: true
    };
  }
  function writeSave2(data) {
    localStorage.setItem(SAVE_KEY3, JSON.stringify(data));
  }
  function initSparkles() {
    const container = document.querySelector(".bg-sparkles");
    if (!container) return;
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty("--d", `${2 + Math.random() * 4}s`);
      s.style.setProperty("--delay", `${Math.random() * 5}s`);
      s.style.setProperty("--op", `${0.3 + Math.random() * 0.7}`);
      s.style.setProperty("--sz", `${6 + Math.floor(Math.random() * 10)}px`);
      container.appendChild(s);
    }
  }
  function resizeBoard() {
    const topHud = document.getElementById("top-hud");
    const bottomBar = document.getElementById("bottom-bar");
    const boardWrap = document.getElementById("board-wrap");
    const container = document.getElementById("board-container");
    if (!container || !boardWrap) return;
    const hudH = topHud ? topHud.offsetHeight : 100;
    const botH = bottomBar ? bottomBar.offsetHeight : 70;
    const margin = 14;
    const availH = Math.max(window.innerHeight - hudH - botH - margin, 160);
    const availW = boardWrap.clientWidth - 16;
    const size = Math.min(availH, availW, 520);
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;
  }
  function initGame() {
    initSparkles();
    const params = new URLSearchParams(window.location.search);
    const levelId = parseInt(params.get("level") || "1", 10);
    const levelData = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    let saveData = loadSave2();
    audio_default.setEnabled(saveData.sound !== false);
    const startAudioContext = () => {
      if (saveData.sound !== false) audio_default.startBGM();
      document.removeEventListener("click", startAudioContext);
    };
    document.addEventListener("click", startAudioContext);
    const boardEl = document.getElementById("board");
    const scoreEl = document.getElementById("score-val");
    const movesEl = document.getElementById("moves-val");
    const goalEl = document.getElementById("goal-display");
    const levelLabelEl = document.getElementById("level-label");
    const confettiCanvas = document.getElementById("confetti-canvas");
    const partyFillEl = document.getElementById("party-meter-fill");
    const partyPctEl = document.getElementById("party-pct");
    const partyOverlay = document.getElementById("party-time-overlay");
    const partyBanner = document.getElementById("party-banner");
    const partyTimerBar = document.getElementById("party-timer-bar");
    const comboDisplay = document.getElementById("combo-display");
    const winOverlay = document.getElementById("win-overlay");
    const loseOverlay = document.getElementById("lose-overlay");
    const pauseOverlay = document.getElementById("pause-overlay");
    const hammerBtn = document.getElementById("booster-hammer");
    const bombBtn = document.getElementById("booster-bomb");
    const rocketBtn = document.getElementById("booster-rocket");
    const rainbowBtn = document.getElementById("booster-rainbow");
    const pauseBtn = document.getElementById("pause-btn");
    if (levelLabelEl) levelLabelEl.textContent = `Level ${levelData.id}`;
    const confetti = new ConfettiSystem(confettiCanvas);
    const party = new party_default();
    party.init({
      fillEl: partyFillEl,
      pctEl: partyPctEl,
      overlayEl: partyOverlay,
      bannerEl: partyBanner,
      timerBarEl: partyTimerBar,
      confetti
    });
    party.onActive = () => {
      audio_default.playPartyVoice?.();
      mascot_default.setPartyMode(true);
      updateStats({ totalParties: 1 });
      checkAchievements(showAchievementToast);
      quests_default.addProgress("party", 1);
    };
    party.onEnd = () => mascot_default.setPartyMode(false);
    mascot_default.mount("mascot-container");
    const noLivesOverlay = document.getElementById("no-lives-overlay");
    const livesTimerEl = document.getElementById("lives-regen-timer");
    function updateNoLivesTimer() {
      if (!noLivesOverlay || noLivesOverlay.classList.contains("hidden")) return;
      const ms = lives_default.getNextRegenMs();
      if (ms !== null && livesTimerEl) {
        livesTimerEl.textContent = lives_default.formatCountdown(ms);
      }
    }
    setInterval(updateNoLivesTimer, 1e3);
    if (!lives_default.hasLives()) {
      if (noLivesOverlay) noLivesOverlay.classList.remove("hidden");
      updateNoLivesTimer();
      return;
    }
    const board = new board_default();
    board.confetti = confetti;
    resizeBoard();
    function startLevel() {
      board.init(boardEl, levelData, party);
      requestAnimationFrame(() => {
        resizeBoard();
        resizeBoard();
      });
      window.addEventListener("resize", resizeBoard);
    }
    if (story_default.hasStory(levelId, "before")) {
      story_default.showDialog(levelId, "before", startLevel);
    } else {
      startLevel();
    }
    updateScore(scoreEl, 0);
    updateMoves(movesEl, levelData.moves);
    renderGoals(goalEl, board.objectives);
    updateBoosterBtn(hammerBtn, saveData.boosters.hammer);
    updateBoosterBtn(bombBtn, saveData.boosters.bomb);
    updateBoosterBtn(rocketBtn, saveData.boosters.rocket);
    updateBoosterBtn(rainbowBtn, saveData.boosters.rainbow);
    board.onScoreChange = (score) => updateScore(scoreEl, score);
    board.onMovesChange = (moves) => updateMoves(movesEl, moves);
    board.onObjectiveUpdate = (objectives) => renderGoals(goalEl, objectives);
    board.onObstacleDestroy = (type) => {
      quests_default.addProgress("destroy", 1);
    };
    board.onMatch = (matchSize) => {
      updateStats({ totalMatches: 1 });
      if (matchSize >= 5) updateStats({ rainbowsUsed: 1 });
      checkAchievements(showAchievementToast);
      quests_default.addProgress("match", 1);
      if (!party.active) {
        if (Math.random() < 0.3) audio_default.playMatchVoice?.();
        mascot_default.react(matchSize >= 4 ? "excited" : "happy");
      }
    };
    board.onCombo = (combo) => {
      updateStats({ maxCombo: combo });
      checkAchievements(showAchievementToast);
      if (combo >= 2) quests_default.addProgress("combo", 1);
      if (combo >= 3) {
        audio_default.playComboVoice?.();
        mascot_default.react(combo >= 5 ? "veryExcited" : "excited");
      }
    };
    board.onWin = (score, movesLeft, objectives) => {
      const stars = calcStars(objectives, levelData.starThresholds);
      saveData.stars[levelId] = Math.max(saveData.stars[levelId] || 0, stars);
      saveData.coins += score;
      saveData.level = Math.max(saveData.level, levelId + 1);
      writeSave2(saveData);
      updateStats({
        totalScore: score,
        bestScore: score,
        highestLevel: levelId,
        totalStars: stars
      });
      checkAchievements(showAchievementToast);
      quests_default.addProgress("win_level", 1);
      quests_default.addProgress("play_level", 1);
      mascot_default.react("win");
      const showWin = () => {
        const winModal = winOverlay?.querySelector(".modal-card");
        if (winModal) {
          winModal.querySelector("#win-score").textContent = score.toLocaleString();
          const starRow = winModal.querySelector(".star-row");
          if (starRow) {
            starRow.innerHTML = "";
            for (let i = 0; i < 3; i++) {
              const s = document.createElement("span");
              s.className = `star-icon${i < stars ? " earned" : ""}`;
              s.textContent = "\u2B50";
              s.style.animationDelay = `${0.2 + i * 0.15}s`;
              starRow.appendChild(s);
            }
          }
          const summary = winModal.querySelector(".goal-summary");
          if (summary) {
            summary.innerHTML = "";
            for (const obj of objectives) {
              const row = document.createElement("div");
              row.className = "goal-row";
              const done = obj.current >= obj.target;
              row.innerHTML = `
              <span>${obj.emoji} ${obj.type === "collect" ? "Collected" : "Destroyed"}</span>
              <span class="${done ? "done" : "fail"}">${obj.current}/${obj.target} ${done ? "\u2713" : "\u2717"}</span>
            `;
              summary.appendChild(row);
            }
          }
          let shareBtn = document.getElementById("btn-win-share");
          if (!shareBtn) {
            const btnGroup = winModal.querySelector(".modal-buttons");
            shareBtn = document.createElement("button");
            shareBtn.id = "btn-win-share";
            shareBtn.className = "btn btn-primary";
            shareBtn.style.background = "linear-gradient(135deg, #c084fc, #ff6eb4)";
            shareBtn.innerHTML = "\u{1F4E4} Pamerkan!";
            btnGroup.insertBefore(shareBtn, btnGroup.children[1]);
          }
          shareBtn.onclick = () => {
            shareScore({ score, stars, level: levelId, levelName: levelData.world || "" });
          };
        }
        if (winOverlay) winOverlay.classList.remove("hidden");
        confetti.start();
        setTimeout(() => confetti.stop(), 5e3);
      };
      if (story_default.hasStory(levelId, "after")) {
        setTimeout(() => story_default.showDialog(levelId, "after", showWin), 1e3);
      } else {
        setTimeout(showWin, 1e3);
      }
    };
    board.onLose = (score, objectives) => {
      lives_default.loseLife();
      mascot_default.react("sad");
      quests_default.addProgress("play_level", 1);
      const loseScore = loseOverlay?.querySelector("#lose-score");
      if (loseScore) loseScore.textContent = score.toLocaleString();
      const summary = loseOverlay?.querySelector(".goal-summary");
      if (summary) {
        summary.innerHTML = "";
        for (const obj of objectives) {
          const row = document.createElement("div");
          row.className = "goal-row";
          const done = obj.current >= obj.target;
          row.innerHTML = `
          <span>${obj.emoji} ${obj.type === "collect" ? "Collect" : "Destroy"}</span>
          <span class="${done ? "done" : "fail"}">${obj.current}/${obj.target} ${done ? "\u2713" : "\u2717"}</span>
        `;
          summary.appendChild(row);
        }
      }
      setTimeout(() => {
        if (loseOverlay) loseOverlay.classList.remove("hidden");
      }, 1e3);
    };
    function useBooster(type) {
      if (saveData.boosters[type] <= 0) return;
      audio_default.playBooster();
      saveData.boosters[type]--;
      writeSave2(saveData);
      quests_default.addProgress("booster", 1, type);
      switch (type) {
        case "hammer":
          board.enableHammer();
          hammerBtn.classList.add("active-mode");
          updateBoosterBtn(hammerBtn, saveData.boosters.hammer);
          break;
        case "bomb":
          board.placeBombBooster();
          updateBoosterBtn(bombBtn, saveData.boosters.bomb);
          break;
        case "rocket":
          board.placeRocketBooster();
          updateBoosterBtn(rocketBtn, saveData.boosters.rocket);
          break;
        case "rainbow":
          board.placeRainbowBooster();
          updateBoosterBtn(rainbowBtn, saveData.boosters.rainbow);
          break;
      }
    }
    hammerBtn?.addEventListener("click", () => {
      if (board.hammerMode) {
        board.disableHammer();
        hammerBtn.classList.remove("active-mode");
      } else {
        useBooster("hammer");
      }
    });
    bombBtn?.addEventListener("click", () => useBooster("bomb"));
    rocketBtn?.addEventListener("click", () => useBooster("rocket"));
    rainbowBtn?.addEventListener("click", () => useBooster("rainbow"));
    pauseBtn?.addEventListener("click", () => {
      board.inputLocked = true;
      pauseOverlay?.classList.remove("hidden");
    });
    document.getElementById("btn-resume")?.addEventListener("click", () => {
      board.inputLocked = false;
      pauseOverlay?.classList.add("hidden");
    });
    document.getElementById("btn-restart")?.addEventListener("click", () => {
      window.location.reload();
    });
    document.getElementById("btn-quit")?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    document.getElementById("btn-win-next")?.addEventListener("click", () => {
      const nextLevel = levelId + 1;
      if (LEVELS.find((l) => l.id === nextLevel)) {
        window.location.href = `game.html?level=${nextLevel}`;
      } else {
        window.location.href = "index.html";
      }
    });
    document.getElementById("btn-win-replay")?.addEventListener("click", () => {
      window.location.reload();
    });
    document.getElementById("btn-win-menu")?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    document.getElementById("btn-lose-retry")?.addEventListener("click", () => {
      if (lives_default.hasLives()) window.location.reload();
      else {
        loseOverlay?.classList.add("hidden");
        noLivesOverlay?.classList.remove("hidden");
        updateNoLivesTimer();
      }
    });
    document.getElementById("btn-lose-menu")?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    document.getElementById("btn-buy-lives")?.addEventListener("click", () => {
      if (lives_default.buyLives(100)) {
        saveData = loadSave2();
        noLivesOverlay?.classList.add("hidden");
        window.location.reload();
      } else {
        alert("Koin tidak cukup! \u{1F622}");
      }
    });
    document.getElementById("btn-wait-lives")?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    document.getElementById("btn-quit-lives")?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    const soundToggle = document.getElementById("sound-toggle");
    if (soundToggle) {
      soundToggle.textContent = saveData.sound ? "\u{1F50A} Sound ON" : "\u{1F507} Sound OFF";
      soundToggle.addEventListener("click", () => {
        saveData.sound = !saveData.sound;
        audio_default.setEnabled(saveData.sound);
        writeSave2(saveData);
        soundToggle.textContent = saveData.sound ? "\u{1F50A} Sound ON" : "\u{1F507} Sound OFF";
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
  } else {
    initGame();
  }
})();
