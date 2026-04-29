import { Chess } from 'chess.js';

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

function evaluateBoard(chess) {
  const board = chess.board();
  let score = 0;

  board.forEach((row) => {
    row.forEach((square) => {
      if (!square) return;
      const value = PIECE_VALUES[square.type] || 0;
      score += square.color === 'w' ? value : -value;
    });
  });

  return score;
}

function getSearchDepth(difficulty) {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  return 3;
}

function moveOrderingScore(move) {
  let score = 0;
  if (move.captured) {
    score += (PIECE_VALUES[move.captured] || 0) * 10;
  }
  if (move.flags && move.flags.includes('p')) {
    score += 50;
  }
  return score;
}

function orderMoves(moves) {
  return moves.slice().sort((a, b) => moveOrderingScore(b) - moveOrderingScore(a));
}

function negamax(chess, depth, alpha, beta, colorFactor) {
  if (depth === 0 || chess.game_over()) {
    return colorFactor * evaluateBoard(chess);
  }

  let maxScore = -Infinity;
  const moves = orderMoves(chess.moves({ verbose: true }));

  for (const move of moves) {
    chess.move(move);
    const score = -negamax(chess, depth - 1, -beta, -alpha, -colorFactor);
    chess.undo();

    if (score > maxScore) {
      maxScore = score;
    }
    if (score > alpha) {
      alpha = score;
    }
    if (alpha >= beta) {
      break;
    }
  }

  return maxScore === -Infinity ? colorFactor * evaluateBoard(chess) : maxScore;
}

export function getBestMove(chess, difficulty, botColor) {
  const depth = getSearchDepth(difficulty);
  const moves = orderMoves(chess.moves({ verbose: true }));
  if (!moves.length) return null;

  const botColorFactor = botColor === 'white' ? 1 : -1;
  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = -negamax(chess, depth - 1, -Infinity, Infinity, -botColorFactor);
    chess.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
