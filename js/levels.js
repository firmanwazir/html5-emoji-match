/**
 * levels.js — Level configuration data
 * 🌸 Sakura Feminine Edition
 */

export const EMOJI_NORMAL = ['🌸', '🦋', '🎀', '🍓', '💎', '🌙'];

export const LEVELS = [
  {
    id: 1,
    name: 'Taman Bunga',
    world: 'Taman Bunga 🌸',
    moves: 15,
    objectives: [
      { type: 'collect', emoji: '🌸', target: 20 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [] },
    preview: '🌸',
    starThresholds: { three: 90, two: 60, one: 30 },
    story: [
      { speaker: 'Mochi', text: 'Halo! Aku Mochi si kucing gemas! 🐱', emoji: '🐱' },
      { speaker: 'Mochi', text: 'Aku ingin mengadakan pesta. Bantu aku kumpulkan bunga Sakura ya! 🌸', emoji: '✨' }
    ]
  },
  {
    id: 2,
    name: 'Pita & Strawberry',
    world: 'Taman Bunga 🌸',
    moves: 20,
    objectives: [
      { type: 'collect', emoji: '🎀', target: 15 },
      { type: 'collect', emoji: '🍓', target: 15 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [] },
    preview: '🎀',
    starThresholds: { three: 90, two: 60, one: 30 }
  },
  {
    id: 3,
    name: 'Rintangan Tidur',
    world: 'Taman Bunga 🌸',
    moves: 25,
    objectives: [
      { type: 'collect', emoji: '💎', target: 10 }
    ],
    boardConfig: {
      emojis: EMOJI_NORMAL,
      obstacles: [ { type: 'sleeping', count: 6 } ]
    },
    preview: '😪',
    starThresholds: { three: 90, two: 60, one: 30 }
  },
  {
    id: 4,
    name: 'Cahaya Bulan',
    world: 'Taman Bunga 🌸',
    moves: 22,
    objectives: [
      { type: 'collect', emoji: '🌙', target: 18 },
      { type: 'collect', emoji: '🦋', target: 12 }
    ],
    boardConfig: {
      emojis: EMOJI_NORMAL,
      obstacles: [ { type: 'angry', count: 4 } ]
    },
    preview: '🌙',
    starThresholds: { three: 90, two: 60, one: 30 }
  },
  {
    id: 5,
    name: 'Hati Terluka',
    world: 'Pantai Bahagia 🏖️',
    moves: 30,
    objectives: [
      { type: 'destroy', emoji: '💔', target: 8 },
      { type: 'collect', emoji: '🎀', target: 10 }
    ],
    boardConfig: {
      emojis: EMOJI_NORMAL,
      obstacles: [ { type: 'crying', count: 3 } ]
    },
    preview: '💔',
    starThresholds: { three: 90, two: 60, one: 30 },
    story: [
      { speaker: 'Mochi', text: 'Wah, kita sampai di Pantai Bahagia! 🏖️', emoji: '🤩' },
      { speaker: 'Mochi', text: 'Tapi ada banyak hati yang terluka di sini... Ayo kita sembuhkan! 💔', emoji: '😢' }
    ]
  },
  {
    id: 6,
    name: 'Pesta Musim Semi',
    world: 'Pantai Bahagia 🏖️',
    moves: 28,
    objectives: [
      { type: 'collect', emoji: '🌸', target: 25 }
    ],
    boardConfig: {
      emojis: EMOJI_NORMAL,
      obstacles: [
        { type: 'angry_strong', count: 4 },
        { type: 'sleeping', count: 3 }
      ]
    },
    preview: '🌸',
    starThresholds: { three: 90, two: 60, one: 30 }
  },
  {
    id: 7,
    name: 'Ombak Pantai',
    world: 'Pantai Bahagia 🏖️',
    moves: 24,
    objectives: [
      { type: 'collect', emoji: '🦋', target: 20 },
      { type: 'destroy', emoji: '😒', target: 5 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry', count: 6 }] },
    preview: '🦋',
    starThresholds: { three: 95, two: 65, one: 35 }
  },
  {
    id: 8,
    name: 'Kerang Mutiara',
    world: 'Pantai Bahagia 🏖️',
    moves: 30,
    objectives: [
      { type: 'collect', emoji: '💎', target: 25 },
      { type: 'collect', emoji: '🎀', target: 20 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'sleeping', count: 5 }] },
    preview: '🐚',
    starThresholds: { three: 100, two: 70, one: 40 }
  },
  {
    id: 9,
    name: 'Jejak Kelinci',
    world: 'Hutan Ajaib 🍄',
    moves: 26,
    objectives: [
      { type: 'collect', emoji: '🍓', target: 22 },
      { type: 'destroy', emoji: '💔', target: 10 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'crying', count: 4 }] },
    preview: '🐇',
    starThresholds: { three: 90, two: 60, one: 30 },
    story: [
      { speaker: 'Mochi', text: 'Hutan Ajaib ini indah sekali! 🍄', emoji: '👀' },
      { speaker: 'Mochi', text: 'Aku melihat jejak kelinci yang lucu... mari kita ikuti! 🐇', emoji: '🐾' }
    ]
  },
  {
    id: 10,
    name: 'Jamur Raksasa',
    world: 'Hutan Ajaib 🍄',
    moves: 32,
    objectives: [
      { type: 'destroy', emoji: '😤', target: 8 },
      { type: 'collect', emoji: '🌸', target: 15 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry_strong', count: 6 }] },
    preview: '🍄',
    starThresholds: { three: 110, two: 75, one: 45 }
  },
  {
    id: 11,
    name: 'Kunang-kunang',
    world: 'Hutan Ajaib 🍄',
    moves: 20,
    objectives: [
      { type: 'collect', emoji: '🌙', target: 30 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'sleeping', count: 6 }, { type: 'crying', count: 2 }] },
    preview: '✨',
    starThresholds: { three: 85, two: 55, one: 25 }
  },
  {
    id: 12,
    name: 'Pohon Bijak',
    world: 'Hutan Ajaib 🍄',
    moves: 28,
    objectives: [
      { type: 'collect', emoji: '💎', target: 15 },
      { type: 'collect', emoji: '🦋', target: 15 },
      { type: 'destroy', emoji: '😒', target: 8 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry', count: 10 }] },
    preview: '🌳',
    starThresholds: { three: 105, two: 75, one: 40 }
  },
  {
    id: 13,
    name: 'Gerbang Pelangi',
    world: 'Istana Awan ☁️',
    moves: 25,
    objectives: [
      { type: 'collect', emoji: '🎀', target: 30 },
      { type: 'destroy', emoji: '😤', target: 5 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry_strong', count: 5 }, { type: 'sleeping', count: 3 }] },
    preview: '🌈',
    starThresholds: { three: 100, two: 70, one: 40 },
    story: [
      { speaker: 'Mochi', text: 'Wow! Kita sudah sampai di Istana Awan! ☁️', emoji: '😲' },
      { speaker: 'Mochi', text: 'Gerbang pelangi ini menghalangi jalan kita. Kita harus mencocokkan pita! 🎀', emoji: '🌈' }
    ]
  },
  {
    id: 14,
    name: 'Bintang Jatuh',
    world: 'Istana Awan ☁️',
    moves: 22,
    objectives: [
      { type: 'collect', emoji: '🌙', target: 20 },
      { type: 'collect', emoji: '🍓', target: 20 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry', count: 8 }] },
    preview: '🌠',
    starThresholds: { three: 95, two: 65, one: 35 }
  },
  {
    id: 15,
    name: 'Putri Kapas',
    world: 'Istana Awan ☁️',
    moves: 35,
    objectives: [
      { type: 'destroy', emoji: '💔', target: 15 },
      { type: 'collect', emoji: '🌸', target: 25 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'crying', count: 6 }] },
    preview: '👸',
    starThresholds: { three: 120, two: 85, one: 50 }
  },
  {
    id: 16,
    name: 'Kastil Kaca',
    world: 'Istana Awan ☁️',
    moves: 30,
    objectives: [
      { type: 'collect', emoji: '💎', target: 40 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry_strong', count: 8 }] },
    preview: '🏰',
    starThresholds: { three: 110, two: 75, one: 45 }
  },
  {
    id: 17,
    name: 'Planet Permen',
    world: 'Galaksi Mochi 🌌',
    moves: 28,
    objectives: [
      { type: 'collect', emoji: '🍓', target: 30 },
      { type: 'collect', emoji: '🎀', target: 30 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'sleeping', count: 8 }] },
    preview: '🍬',
    starThresholds: { three: 115, two: 80, one: 45 },
    story: [
      { speaker: 'Mochi', text: 'Astaga! Kita terbang ke Galaksi Mochi! 🌌', emoji: '🚀' },
      { speaker: 'Mochi', text: 'Semuanya terbuat dari permen di planet ini! Yummy! 🍬', emoji: '🤤' }
    ]
  },
  {
    id: 18,
    name: 'Orbit Ceria',
    world: 'Galaksi Mochi 🌌',
    moves: 26,
    objectives: [
      { type: 'destroy', emoji: '😒', target: 12 },
      { type: 'collect', emoji: '🦋', target: 20 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry', count: 12 }] },
    preview: '🛸',
    starThresholds: { three: 105, two: 75, one: 40 }
  },
  {
    id: 19,
    name: 'Sabuk Meteor',
    world: 'Galaksi Mochi 🌌',
    moves: 32,
    objectives: [
      { type: 'destroy', emoji: '😤', target: 10 },
      { type: 'destroy', emoji: '💔', target: 8 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry_strong', count: 8 }, { type: 'crying', count: 4 }] },
    preview: '☄️',
    starThresholds: { three: 130, two: 95, one: 55 }
  },
  {
    id: 20,
    name: 'Mochi Supernova',
    world: 'Galaksi Mochi 🌌',
    moves: 40,
    objectives: [
      { type: 'collect', emoji: '🌸', target: 30 },
      { type: 'collect', emoji: '💎', target: 30 },
      { type: 'collect', emoji: '🌙', target: 30 }
    ],
    boardConfig: { emojis: EMOJI_NORMAL, obstacles: [{ type: 'angry_strong', count: 10 }, { type: 'crying', count: 5 }] },
    preview: '🌌',
    starThresholds: { three: 150, two: 110, one: 65 }
  },
  {
    id: 99,
    name: '🌟 Weekly Challenge',
    world: 'Tantangan Spesial 🎁',
    moves: 15,
    objectives: [
      { type: 'collect', emoji: '💎', target: 30 },
      { type: 'destroy', emoji: '😤', target: 5 }
    ],
    boardConfig: {
      emojis: ['🌸', '💎', '🌙', '🎀'], // Fewer types = more matches!
      obstacles: [
        { type: 'angry_strong', count: 5 }
      ]
    },
    preview: '🌟',
    starThresholds: { three: 80, two: 50, one: 20 }
  }
];

export const TILE_TYPES = {
  NORMAL:       'normal',
  ANGRY:        'angry',        // HP: 1 -> now "😒" Unamused
  ANGRY_STRONG: 'angry_strong', // HP: 2 -> now "😤" Triumph
  SLEEPING:     'sleeping',     // HP: 1, needs adjacent match -> now "😪" Sleepy
  CRYING:       'crying',       // Spreads -> now "💔" Broken Heart
  ROCKET:       'rocket',
  BOMB:         'bomb',
  RAINBOW:      'rainbow'
};

export const SCORE_TABLE = {
  match3: 30,
  match4: 60,
  match5: 100,
  lShape: 80,
  tShape: 80,
  rocket: 50,
  bomb:   80,
  rainbow: 120
};

export const PARTY_FILL = {
  match3: 5,
  match4: 10,
  match5: 15,
  bomb:   20,
  rocket: 12,
  rainbow:25
};

export const COMBO_MULT = { 1:1, 2:1.2, 3:1.5, 4:2, 5:2 };
export const COMBO_BONUS_TEXT = { 2:'NICE!', 3:'GREAT!', 4:'AMAZING!', 5:'🎉 PARTY BONUS!' };

export default { LEVELS, TILE_TYPES, EMOJI_NORMAL, SCORE_TABLE, PARTY_FILL, COMBO_MULT, COMBO_BONUS_TEXT };
