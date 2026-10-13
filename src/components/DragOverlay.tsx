import React from 'react';
import { GamePiece } from '../utils/shapes';
import { Theme } from '../types/theme';

interface DragOverlayProps {
  activePiece: GamePiece | null;
  dragPos: { x: number; y: number } | null;
  theme: Theme;
  boardCellSize: number;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
  activePiece,
  dragPos,
  theme,
  boardCellSize,
}) => {
  if (!activePiece || !dragPos) return null;

  const pieceColor = theme.blockColors[activePiece.colorIndex % theme.blockColors.length];
  const cellSize = Math.max(28, Math.min(boardCellSize, 46));

  // Offset elevated above finger tip so thumb never blocks the view
  const verticalFingerOffset = 75;

  const width = activePiece.cols * cellSize + (activePiece.cols - 1) * 6;
  const height = activePiece.rows * cellSize + (activePiece.rows - 1) * 6;

  return (
    <div
      style={{
        left: `${dragPos.x}px`,
        top: `${dragPos.y - verticalFingerOffset}px`,
        transform: 'translate(-50%, -50%) scale(1.05)',
        filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.22))',
      }}
      className="fixed pointer-events-none z-50 select-none touch-none"
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          gridTemplateRows: `repeat(${activePiece.rows}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${activePiece.cols}, ${cellSize}px)`,
          gap: '6px',
        }}
        className="grid"
      >
        {activePiece.matrix.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: cell === 1 ? pieceColor : 'transparent',
                borderRadius: '7px',
              }}
              className={cell === 1 ? 'tactile-block' : ''}
            />
          ))
        )}
      </div>
    </div>
  );
};
