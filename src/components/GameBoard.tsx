import React from 'react';
import { BoardGrid, BOARD_SIZE } from '../utils/gameLogic';
import { Theme } from '../types/theme';
import { GamePiece } from '../utils/shapes';
import { Sparkles } from 'lucide-react';

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

interface GameBoardProps {
  grid: BoardGrid;
  theme: Theme;
  hoverPos: { r: number; c: number } | null;
  activePiece: GamePiece | null;
  isValidHover: boolean;
  highlightLines: { rows: number[]; cols: number[] };
  clearingCells: Map<string, number>; // key -> delay in ms
  boardRef: React.RefObject<HTMLDivElement | null>;
  particles: Particle[];
  isPunching: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  theme,
  hoverPos,
  activePiece,
  isValidHover,
  highlightLines,
  clearingCells,
  boardRef,
  particles,
  isPunching,
}) => {
  // Build preview matrix map
  const previewCells = new Map<string, string>();
  if (hoverPos && activePiece && isValidHover) {
    const pieceColor = theme.blockColors[activePiece.colorIndex % theme.blockColors.length];
    for (let r = 0; r < activePiece.rows; r++) {
      for (let c = 0; c < activePiece.cols; c++) {
        if (activePiece.matrix[r][c] === 1) {
          const boardR = hoverPos.r + r;
          const boardC = hoverPos.c + c;
          if (boardR >= 0 && boardR < BOARD_SIZE && boardC >= 0 && boardC < BOARD_SIZE) {
            previewCells.set(`${boardR},${boardC}`, pieceColor);
          }
        }
      }
    }
  }

  const willClearLinesCount = highlightLines.rows.length + highlightLines.cols.length;

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-square px-3 py-1 select-none touch-none">
      {/* Board Outer Container with punch impact on clear */}
      <div
        ref={boardRef}
        style={{
          backgroundColor: theme.bgBoard,
          borderColor: willClearLinesCount > 0 ? 'rgba(235, 160, 60, 0.65)' : theme.boardBorder,
          boxShadow: theme.boardShadow,
        }}
        className={`w-full h-full rounded-[26px] border-2 p-2.5 relative grid grid-cols-8 grid-rows-8 gap-1.5 sm:gap-2 overflow-hidden transition-all duration-200 ${
          isPunching ? 'animate-board-punch' : ''
        }`}
      >
        {/* Soft, warm row highlight overlay when line(s) will clear */}
        {highlightLines.rows.map((rowIdx) => (
          <div
            key={`row-hl-${rowIdx}`}
            className="absolute left-2.5 right-2.5 pointer-events-none z-10 rounded-[8px] animate-line-preview"
            style={{
              top: `calc(${rowIdx} * (100% - 20px) / 8 + 10px)`,
              height: `calc((100% - 20px) / 8 - 4px)`,
              background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.35) 50%, rgba(251, 191, 36, 0.15) 100%)',
              borderTop: '1.5px solid rgba(251, 191, 36, 0.7)',
              borderBottom: '1.5px solid rgba(251, 191, 36, 0.7)',
            }}
          />
        ))}

        {/* Soft, warm column highlight overlay when column(s) will clear */}
        {highlightLines.cols.map((colIdx) => (
          <div
            key={`col-hl-${colIdx}`}
            className="absolute top-2.5 bottom-2.5 pointer-events-none z-10 rounded-[8px] animate-line-preview"
            style={{
              left: `calc(${colIdx} * (100% - 20px) / 8 + 10px)`,
              width: `calc((100% - 20px) / 8 - 4px)`,
              background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.35) 50%, rgba(251, 191, 36, 0.15) 100%)',
              borderLeft: '1.5px solid rgba(251, 191, 36, 0.7)',
              borderRight: '1.5px solid rgba(251, 191, 36, 0.7)',
            }}
          />
        ))}

        {/* 8x8 Grid Cells: Square geometry */}
        {Array.from({ length: BOARD_SIZE }).map((_, r) =>
          Array.from({ length: BOARD_SIZE }).map((_, c) => {
            const key = `${r},${c}`;
            const filledColor = grid[r][c];
            const previewColor = previewCells.get(key);
            const clearDelay = clearingCells.get(key);
            const isClearing = clearDelay !== undefined;
            const isCandidateLine =
              highlightLines.rows.includes(r) || highlightLines.cols.includes(c);

            return (
              <div
                key={key}
                data-row={r}
                data-col={c}
                style={{
                  backgroundColor: theme.cellEmpty,
                  borderColor: isCandidateLine
                    ? 'rgba(245, 158, 11, 0.85)'
                    : theme.cellEmptyBorder,
                  boxShadow: isCandidateLine
                    ? '0 0 10px rgba(245, 158, 11, 0.45), inset 0 0 5px rgba(254, 243, 199, 0.4)'
                    : theme.cellEmptyInnerShadow,
                }}
                className={`relative rounded-[8px] border transition-all duration-150 overflow-hidden flex items-center justify-center ${
                  isCandidateLine ? 'ring-1 ring-amber-400/60 z-10' : ''
                }`}
              >
                {/* Placed square block */}
                {filledColor && (
                  <div
                    style={{
                      backgroundColor: filledColor,
                      animationDelay: isClearing ? `${clearDelay}ms` : '0ms',
                    }}
                    className={`w-full h-full tactile-block rounded-[7px] ${
                      isClearing
                        ? 'animate-clear-satisfaction'
                        : isCandidateLine
                        ? 'animate-candidate-cell'
                        : 'animate-drop-snap'
                    }`}
                  />
                )}

                {/* Ghost preview block */}
                {!filledColor && previewColor && (
                  <div
                    style={{
                      backgroundColor: previewColor,
                      opacity: 0.65,
                      borderColor: isCandidateLine
                        ? 'rgba(251, 191, 36, 0.95)'
                        : 'rgba(255, 255, 255, 0.7)',
                    }}
                    className={`w-full h-full rounded-[7px] border-2 ${
                      isCandidateLine ? 'animate-candidate-cell ring-2 ring-amber-300' : 'animate-pulse'
                    } scale-95`}
                  />
                )}
              </div>
            );
          })
        )}

        {/* Square Shards Particles: Tumbling square chips */}
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {particles.map((p) => (
              <div
                key={p.id}
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  opacity: p.alpha,
                  transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
                  borderRadius: '2.5px', // Square chip, not round!
                  boxShadow: `0 1px 3px rgba(0,0,0,0.25)`,
                }}
                className="absolute pointer-events-none"
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Clear Preview Tag above the board when hover creates lines to clear */}
      {willClearLinesCount > 0 && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-bounce">
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.95)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
            }}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md border border-white/40"
          >
            <Sparkles size={12} className="fill-white" />
            <span>
              {willClearLinesCount === 1
                ? 'Очистка линии'
                : `Очистка ${willClearLinesCount} линий (Combo x${willClearLinesCount})`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
