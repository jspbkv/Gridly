export interface ShapeDef {
  id: string;
  matrix: number[][];
  rows: number;
  cols: number;
  blockCount: number;
}

export interface GamePiece extends ShapeDef {
  uid: string;
  colorIndex: number;
}

// Complete library of classic Block Blast shapes
export const SHAPE_TEMPLATES: ShapeDef[] = [
  // 1x1 Single
  {
    id: 'dot-1',
    matrix: [[1]],
    rows: 1,
    cols: 1,
    blockCount: 1,
  },
  // Lines: 2x1 and 1x2
  {
    id: 'line-2-h',
    matrix: [[1, 1]],
    rows: 1,
    cols: 2,
    blockCount: 2,
  },
  {
    id: 'line-2-v',
    matrix: [[1], [1]],
    rows: 2,
    cols: 1,
    blockCount: 2,
  },
  // Lines: 3x1 and 1x3
  {
    id: 'line-3-h',
    matrix: [[1, 1, 1]],
    rows: 1,
    cols: 3,
    blockCount: 3,
  },
  {
    id: 'line-3-v',
    matrix: [[1], [1], [1]],
    rows: 3,
    cols: 1,
    blockCount: 3,
  },
  // Lines: 4x1 and 1x4
  {
    id: 'line-4-h',
    matrix: [[1, 1, 1, 1]],
    rows: 1,
    cols: 4,
    blockCount: 4,
  },
  {
    id: 'line-4-v',
    matrix: [[1], [1], [1], [1]],
    rows: 4,
    cols: 1,
    blockCount: 4,
  },
  // Lines: 5x1 and 1x5
  {
    id: 'line-5-h',
    matrix: [[1, 1, 1, 1, 1]],
    rows: 1,
    cols: 5,
    blockCount: 5,
  },
  {
    id: 'line-5-v',
    matrix: [[1], [1], [1], [1], [1]],
    rows: 5,
    cols: 1,
    blockCount: 5,
  },
  // Square 2x2
  {
    id: 'sq-2',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    rows: 2,
    cols: 2,
    blockCount: 4,
  },
  // Square 3x3
  {
    id: 'sq-3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    rows: 3,
    cols: 3,
    blockCount: 9,
  },
  // Corner / Small L (2x2, 3 blocks)
  {
    id: 'corner-tl',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    rows: 2,
    cols: 2,
    blockCount: 3,
  },
  {
    id: 'corner-tr',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    rows: 2,
    cols: 2,
    blockCount: 3,
  },
  {
    id: 'corner-bl',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    rows: 2,
    cols: 2,
    blockCount: 3,
  },
  {
    id: 'corner-br',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    rows: 2,
    cols: 2,
    blockCount: 3,
  },
  // Standard L (3x2 and 2x3, 4 blocks)
  {
    id: 'l-std-1',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  {
    id: 'l-std-2',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  {
    id: 'l-std-3',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  {
    id: 'l-std-4',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  {
    id: 'l-std-5',
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  {
    id: 'l-std-6',
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  {
    id: 'l-std-7',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  {
    id: 'l-std-8',
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  // Big L (3x3, 5 blocks)
  {
    id: 'l-big-1',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    rows: 3,
    cols: 3,
    blockCount: 5,
  },
  {
    id: 'l-big-2',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    rows: 3,
    cols: 3,
    blockCount: 5,
  },
  {
    id: 'l-big-3',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    rows: 3,
    cols: 3,
    blockCount: 5,
  },
  {
    id: 'l-big-4',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    rows: 3,
    cols: 3,
    blockCount: 5,
  },
  // T-shapes (3x2 and 2x3, 4 blocks)
  {
    id: 't-1',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  {
    id: 't-2',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  {
    id: 't-3',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  {
    id: 't-4',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  // Z and S shapes
  {
    id: 'z-h',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  {
    id: 's-h',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    rows: 2,
    cols: 3,
    blockCount: 4,
  },
  {
    id: 'z-v',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  {
    id: 's-v',
    matrix: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    rows: 3,
    cols: 2,
    blockCount: 4,
  },
  // Plus / Cross (3x3, 5 blocks)
  {
    id: 'plus',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    rows: 3,
    cols: 3,
    blockCount: 5,
  },
];

// Helper to spawn 3 balanced game pieces
export function spawnPieces(paletteSize: number = 8): GamePiece[] {
  const pieces: GamePiece[] = [];
  const usedColors = new Set<number>();

  for (let i = 0; i < 3; i++) {
    // Pick random template
    let template: ShapeDef;
    if (i === 0) {
      // Slot 0 has higher probability of smaller/manageable shapes for fair flow
      const easier = SHAPE_TEMPLATES.filter((s) => s.blockCount <= 4);
      template = easier[Math.floor(Math.random() * easier.length)];
    } else {
      template = SHAPE_TEMPLATES[Math.floor(Math.random() * SHAPE_TEMPLATES.length)];
    }

    // Pick distinct color if possible
    let colorIndex = Math.floor(Math.random() * paletteSize);
    let attempts = 0;
    while (usedColors.has(colorIndex) && attempts < 10) {
      colorIndex = (colorIndex + 1) % paletteSize;
      attempts++;
    }
    usedColors.add(colorIndex);

    pieces.push({
      ...template,
      uid: `${template.id}-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      colorIndex,
    });
  }

  return pieces;
}
