import React from 'react';
import { GamePiece } from '../utils/shapes';
import { Theme } from '../types/theme';

interface PieceTrayProps {
  pieces: (GamePiece | null)[];
  theme: Theme;
  onPiecePointerDown: (
    piece: GamePiece,
    index: number,
    clientX: number,
    clientY: number
  ) => void;
  draggingIndex: number | null;
  canPlaceFlags: boolean[];
  spawnKey: number; // Increment to re-trigger spawn bounce
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  pieces,
  theme,
  onPiecePointerDown,
  draggingIndex,
  canPlaceFlags,
  spawnKey,
}) => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-4 select-none touch-none">
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: theme.cardShadow,
        }}
        className="grid grid-cols-3 gap-2.5 p-3 rounded-[24px] border min-h-[114px] items-center justify-items-center transition-colors duration-200"
      >
        {pieces.map((piece, index) => {
          if (!piece) {
            return (
              <div
                key={`empty-slot-${index}`}
                style={{
                  backgroundColor: theme.cellEmpty,
                  borderColor: theme.cellEmptyBorder,
                }}
                className="w-full h-24 rounded-2xl flex items-center justify-center opacity-30 border border-dashed"
              />
            );
          }

          const isDragging = draggingIndex === index;
          const canFit = canPlaceFlags[index] ?? true;
          const pieceColor = theme.blockColors[piece.colorIndex % theme.blockColors.length];

          // Compute size of blocks in tray slot
          const maxDim = Math.max(piece.rows, piece.cols);
          const cellSize = maxDim <= 2 ? 26 : maxDim === 3 ? 20 : maxDim === 4 ? 16 : 13;

          return (
            <div
              key={`${piece.uid}-${spawnKey}`}
              style={{
                backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.03)',
                animationDelay: `${index * 80}ms`,
              }}
              className={`w-full h-24 rounded-2xl flex items-center justify-center relative touch-none select-none transition-all duration-150 cursor-grab active:cursor-grabbing animate-tray-spawn ${
                isDragging
                  ? 'opacity-0 scale-75'
                  : 'opacity-100 hover:scale-[1.03] active:scale-95'
              } ${!canFit ? 'opacity-30 grayscale-[50%]' : ''}`}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPiecePointerDown(piece, index, e.clientX, e.clientY);
              }}
            >
              {/* Inner mini grid of clean square tiles */}
              <div
                style={{
                  gridTemplateRows: `repeat(${piece.rows}, ${cellSize}px)`,
                  gridTemplateColumns: `repeat(${piece.cols}, ${cellSize}px)`,
                  gap: '3px',
                }}
                className="grid"
              >
                {piece.matrix.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor: cell === 1 ? pieceColor : 'transparent',
                        borderRadius: cellSize <= 16 ? '3.5px' : '5px',
                      }}
                      className={cell === 1 ? 'tactile-block' : ''}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
