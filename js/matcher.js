/**
 * matcher.js — Match detection: 3/4/5 in a row, L-shape, T-shape
 */

const COLS = 8;
const ROWS = 8;

/**
 * Find all matches on the board.
 * Returns array of match objects: { cells: [[r,c],...], type, baseEmoji }
 */
function findAllMatches(grid) {
  const matched = new Set();
  const matches = [];

  // Horizontal scan
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS) {
      const cell = grid[r][c];
      if (!cell || !isMatchable(cell)) { c++; continue; }
      let len = 1;
      while (c + len < COLS && grid[r][c + len]?.type === cell.type) len++;
      if (len >= 3) {
        const cells = [];
        for (let i = 0; i < len; i++) cells.push([r, c + i]);
        matches.push({ cells, orientation: 'h', baseEmoji: cell.emoji, type: cell.type, count: len });
      }
      c += len;
    }
  }

  // Vertical scan
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS) {
      const cell = grid[r][c];
      if (!cell || !isMatchable(cell)) { r++; continue; }
      let len = 1;
      while (r + len < ROWS && grid[r + len][c]?.type === cell.type) len++;
      if (len >= 3) {
        const cells = [];
        for (let i = 0; i < len; i++) cells.push([r + i, c]);
        matches.push({ cells, orientation: 'v', baseEmoji: cell.emoji, type: cell.type, count: len });
      }
      r += len;
    }
  }

  // Merge overlapping matches (same cells) and detect L/T shapes
  const result = mergeAndClassify(matches, grid);
  return result;
}

/**
 * Merge overlapping match groups and classify type
 */
function mergeAndClassify(matches, grid) {
  if (matches.length === 0) return [];

  // Group by type of emoji
  const byType = {};
  for (const m of matches) {
    if (!byType[m.type]) byType[m.type] = [];
    byType[m.type].push(m);
  }

  const result = [];

  for (const type in byType) {
    const group = byType[type];
    // Build cell set
    const allCells = new Set();
    const cellList = [];
    for (const m of group) {
      for (const [r,c] of m.cells) {
        const key = `${r},${c}`;
        if (!allCells.has(key)) {
          allCells.add(key);
          cellList.push([r,c]);
        }
      }
    }

    // Classify shape
    const hMatches = group.filter(m => m.orientation === 'h');
    const vMatches = group.filter(m => m.orientation === 'v');

    let matchType = 'match3';
    const totalUnique = cellList.length;

    if (hMatches.length > 0 && vMatches.length > 0) {
      // Intersection — L or T shape
      const hCells = new Set(hMatches.flatMap(m => m.cells.map(c => `${c[0]},${c[1]}`)));
      const vCells = new Set(vMatches.flatMap(m => m.cells.map(c => `${c[0]},${c[1]}`)));
      const intersections = [...hCells].filter(k => vCells.has(k));

      if (intersections.length === 1) {
        matchType = 'lShape'; // Could be T too — let total cells decide
        if (hMatches.some(m => m.count >= 3) && vMatches.some(m => m.count >= 3) && totalUnique >= 5) {
          matchType = 'tShape';
        }
      }
    } else {
      const maxLen = Math.max(...group.map(m => m.count));
      if (maxLen >= 5) matchType = 'match5';
      else if (maxLen === 4) matchType = 'match4';
      else matchType = 'match3';
    }

    result.push({
      cells: cellList,
      matchType,
      type,
      emoji: grid[cellList[0][0]][cellList[0][1]]?.emoji,
      pivotCell: cellList[Math.floor(cellList.length / 2)] // center for special spawn
    });
  }

  return result;
}

/**
 * Returns true if a tile can participate in matches
 */
function isMatchable(cell) {
  if (!cell) return false;
  if (cell.isObstacle) return false;
  if (cell.type === 'rocket' || cell.type === 'bomb' || cell.type === 'rainbow') return false;
  return true;
}

/**
 * Check if a specific position would form a match (for initial board generation)
 */
function wouldMatch(grid, r, c, type) {
  // Horizontal check
  const left1  = c >= 1 ? grid[r][c-1]?.type : null;
  const left2  = c >= 2 ? grid[r][c-2]?.type : null;
  const right1 = c < COLS-1 ? grid[r][c+1]?.type : null;
  const right2 = c < COLS-2 ? grid[r][c+2]?.type : null;

  if (left1 === type && left2  === type) return true;
  if (left1 === type && right1 === type) return true;
  if (right1 === type && right2 === type) return true;

  // Vertical check
  const up1   = r >= 1 ? grid[r-1][c]?.type : null;
  const up2   = r >= 2 ? grid[r-2][c]?.type : null;
  const down1 = r < ROWS-1 ? grid[r+1][c]?.type : null;
  const down2 = r < ROWS-2 ? grid[r+2][c]?.type : null;

  if (up1 === type && up2   === type) return true;
  if (up1 === type && down1 === type) return true;
  if (down1 === type && down2 === type) return true;

  return false;
}

/**
 * Check if ANY valid move exists on the board (to detect deadlock)
 */
function hasAnyValidMove(grid) {
  // Try every adjacent swap and see if it would produce a match
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Right swap
      if (c < COLS - 1) {
        swapCells(grid, r, c, r, c+1);
        const m = findAllMatches(grid);
        swapCells(grid, r, c, r, c+1);
        if (m.length > 0) return true;
      }
      // Down swap
      if (r < ROWS - 1) {
        swapCells(grid, r, c, r+1, c);
        const m = findAllMatches(grid);
        swapCells(grid, r, c, r+1, c);
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

/**
 * Get cells adjacent to a given cell
 */
function getAdjacentCells(r, c) {
  const adj = [];
  if (r > 0)        adj.push([r-1, c]);
  if (r < ROWS - 1) adj.push([r+1, c]);
  if (c > 0)        adj.push([r, c-1]);
  if (c < COLS - 1) adj.push([r, c+1]);
  return adj;
}

/**
 * Get a single valid move hint (for tutorial or hint system)
 * Returns {r1, c1, r2, c2} or null if no moves
 */
function getHint(grid) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!isMatchable(grid[r][c])) continue;
      
      // Right swap
      if (c < COLS - 1 && isMatchable(grid[r][c+1])) {
        swapCells(grid, r, c, r, c+1);
        const m = findAllMatches(grid);
        swapCells(grid, r, c, r, c+1);
        if (m.length > 0) return { r1: r, c1: c, r2: r, c2: c+1 };
      }
      // Down swap
      if (r < ROWS - 1 && isMatchable(grid[r+1][c])) {
        swapCells(grid, r, c, r+1, c);
        const m = findAllMatches(grid);
        swapCells(grid, r, c, r+1, c);
        if (m.length > 0) return { r1: r, c1: c, r2: r+1, c2: c };
      }
    }
  }
  return null;
}

export { findAllMatches, wouldMatch, hasAnyValidMove, getAdjacentCells, getHint, COLS, ROWS };
