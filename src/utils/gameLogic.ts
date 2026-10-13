import { GamePiece, ShapeDef } from './shapes';

export const BOARD_SIZE = 8;

export type BoardGrid = (string | null)[][]; // Hex color string or null

export interface ClearResult {
  clearedRows: number[];
  clearedCols: number[];
  clearedCells: Array<{ r: number; c: number }>;
  totalLines: number;
  addedScore: number;
}

// Create blank 8x8 grid
export function createEmptyGrid(): BoardGrid {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

// Check if a shape can be placed at a specific board position
export function canPlacePiece(
  grid: BoardGrid,
  shape: ShapeDef,
  startRow: number,
  startCol: number
): boolean {
  for (let r = 0; r < shape.rows; r++) {
    for (let c = 0; c < shape.cols; c++) {
      if (shape.matrix[r][c] === 1) {
        const boardR = startRow + r;
        const boardC = startCol + c;

        // Out of bounds
        if (boardR < 0 || boardR >= BOARD_SIZE || boardC < 0 || boardC >= BOARD_SIZE) {
          return false;
        }

        // Target cell already occupied
        if (grid[boardR][boardC] !== null) {
          return false;
        }
      }
    }
  }
  return true;
}

// Check if a shape can fit anywhere on the board
export function canPlaceAnywhere(grid: BoardGrid, shape: ShapeDef): boolean {
  for (let r = 0; r <= BOARD_SIZE - shape.rows; r++) {
    for (let c = 0; c <= BOARD_SIZE - shape.cols; c++) {
      if (canPlacePiece(grid, shape, r, c)) {
        return true;
      }
    }
  }
  return false;
}

// Check if all remaining pieces can still make at least one move
export function hasAnyValidMove(grid: BoardGrid, pieces: (GamePiece | null)[]): boolean {
  const activePieces = pieces.filter((p): p is GamePiece => p !== null);
  if (activePieces.length === 0) return true; // Empty tray means new pieces will spawn

  for (const piece of activePieces) {
    if (canPlaceAnywhere(grid, piece)) {
      return true;
    }
  }
  return false;
}

// Simulate lines that would be cleared if a piece was placed at startRow, startCol
export function simulateLinesCleared(
  grid: BoardGrid,
  shape: ShapeDef,
  startRow: number,
  startCol: number
): { rows: number[]; cols: number[] } {
  // Create temp grid
  const temp = grid.map((row) => [...row]);
  for (let r = 0; r < shape.rows; r++) {
    for (let c = 0; c < shape.cols; c++) {
      if (shape.matrix[r][c] === 1) {
        temp[startRow + r][startCol + c] = '#fff';
      }
    }
  }

  const rows: number[] = [];
  const cols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (temp[r].every((cell) => cell !== null)) {
      rows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let colFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (temp[r][c] === null) {
        colFull = false;
        break;
      }
    }
    if (colFull) {
      cols.push(c);
    }
  }

  return { rows, cols };
}

// Place piece on board and check for completed lines
export function applyPiecePlacement(
  grid: BoardGrid,
  piece: GamePiece,
  startRow: number,
  startCol: number,
  color: string,
  currentCombo: number
): {
  newGrid: BoardGrid;
  clearResult: ClearResult | null;
  newCombo: number;
  scoreGained: number;
} {
  const newGrid = grid.map((row) => [...row]);

  // 1. Place the piece blocks
  for (let r = 0; r < piece.rows; r++) {
    for (let c = 0; c < piece.cols; c++) {
      if (piece.matrix[r][c] === 1) {
        newGrid[startRow + r][startCol + c] = color;
      }
    }
  }

  // Base points for placing the piece (10 points per tile block)
  let scoreGained = piece.blockCount * 10;

  // 2. Identify full rows and columns
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newGrid[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let colFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newGrid[r][c] === null) {
        colFull = false;
        break;
      }
    }
    if (colFull) {
      fullCols.push(c);
    }
  }

  const totalLines = fullRows.length + fullCols.length;

  if (totalLines > 0) {
    const newCombo = currentCombo + 1;

    // Collect all cells to clear (avoid duplicates on row/column intersections)
    const clearedCellsMap = new Map<string, { r: number; c: number }>();

    for (const r of fullRows) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        clearedCellsMap.set(`${r},${c}`, { r, c });
      }
    }

    for (const c of fullCols) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        clearedCellsMap.set(`${r},${c}`, { r, c });
      }
    }

    // Clear cells from grid
    for (const { r, c } of clearedCellsMap.values()) {
      newGrid[r][c] = null;
    }

    // Points calculation:
    // Base line points: 100 for 1 line, 300 for 2 lines, 600 for 3, 1000 for 4+
    const lineBase = [0, 100, 300, 600, 1000, 1500, 2100][Math.min(totalLines, 6)];
    const comboMultiplier = Math.max(1, newCombo);
    const lineScore = lineBase * comboMultiplier;

    scoreGained += lineScore;

    const clearResult: ClearResult = {
      clearedRows: fullRows,
      clearedCols: fullCols,
      clearedCells: Array.from(clearedCellsMap.values()),
      totalLines,
      addedScore: lineScore,
    };

    return {
      newGrid,
      clearResult,
      newCombo,
      scoreGained,
    };
  }

  // No lines cleared: combo resets to 0
  return {
    newGrid,
    clearResult: null,
    newCombo: 0,
    scoreGained,
  };
}
