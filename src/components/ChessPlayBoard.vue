<template>
  <section class="page-card chess-panel">
    <div class="board-frame">
      <ChessBoardDisplay
        :board="boardSquares"
        :selected="selectedSquare"
        :availableMoves="availableMoves"
        :lastMove="lastMove"
        @square-click="onSquareClick"
      />
    </div>

    <div class="board-footer">
      <div class="grid-columns columns-2">
        <div class="page-card">
          <h2 class="section-title">Difficulty</h2>
          <p>{{ difficulty.charAt(0).toUpperCase() + difficulty.slice(1) }}</p>
          <p class="subtitle">Choose how challenging the bot will be.</p>
        </div>

        <div class="page-card">
          <h2 class="section-title">Game status</h2>
          <p class="subtitle">{{ statusMessage }}</p>
          <p><strong>Result:</strong> <span>{{ gameResultText }}</span></p>
          <p><strong>Moves:</strong> {{ history.length }}</p>
        </div>
      </div>

      <div class="form-actions">
        <button class="ghost-button" type="button" @click="resignGame" :disabled="finished">Resign</button>
      </div>

      <!-- Save message removed as auto-save has no UI feedback -->
    </div>

    <div v-if="finished" class="game-over-overlay">
      <div class="game-over-card">
        <h2>{{ endTitle }}</h2>
        <p class="subtitle">{{ endSubtitle }}</p>

        <div class="result-details">
          <p><strong>Result:</strong> {{ gameResultText }}</p>
          <p><strong>Your points:</strong> {{ userStore.user?.points ?? '-' }} <span :class="{ 'points-positive': pointsChange > 0, 'points-negative': pointsChange < 0 }">({{ pointsChangeText }})</span></p>
        </div>

        <div class="form-actions">
          <button class="cta-button" type="button" @click="reviewSavedGame">Review game</button>
          <button class="ghost-button" type="button" @click="startNewGame">Play again</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Chess } from 'chess.js';
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import ChessBoardDisplay from './ChessBoardDisplay.vue';
import { useUserStore } from '../stores/user';
import stockfishWorkerUrl from '../../stockfish-18-lite-single.js?url';

const props = defineProps({
  difficulty: { type: String, default: 'easy' },
  userColor: { type: String, default: 'white' },
});

const userStore = useUserStore();
const router = useRouter();
const isAuthenticated = userStore.isAuthenticated;
const chess = new Chess();
const selectedSquare = ref('');
const availableMoves = ref([]);
const lastMove = ref([]);
const finished = ref(false);
const resultTag = ref('');
const actualUserColor = ref(props.userColor);
const currentTurn = ref(chess.turn());
const boardSquares = ref([]);
const history = ref(chess.history());
const pointsBeforeGame = ref(userStore.user?.points ?? 0);
const pointsChange = ref(0);
const savedGameId = ref(null);

const stockfishWorker = ref(null);
const stockfishReady = ref(false);
const stockfishReadyPromise = ref(null);
const stockfishReadyResolver = ref(null);
const stockfishMoveResolver = ref(null);
const engineTiming = {
  easy: 1,
  medium: 2,
  hard: 3,
};const engineSkillLevels = {
  easy: 1,
  medium: 5,
  hard: 10,
};
function initStockfish() {
  if (typeof Worker === 'undefined') {
    console.warn('Web Workers are not available in this environment');
    return;
  }

  try {
    stockfishReadyPromise.value = new Promise((resolve) => {
      stockfishReadyResolver.value = resolve;
    });

    stockfishWorker.value = new Worker(stockfishWorkerUrl);
    stockfishWorker.value.addEventListener('message', onStockfishMessage);
    stockfishWorker.value.addEventListener('error', (error) => {
      console.error('Stockfish worker error', error);
    });
    stockfishWorker.value.postMessage('uci');
    sendStockfishCommand('setoption name UCI_LimitStrength value true');
    sendStockfishCommand(`setoption name Skill Level value ${engineSkillLevels[props.difficulty] || 5}`);
    stockfishWorker.value.postMessage('isready');
  } catch (error) {
    console.error('Unable to initialize Stockfish worker', error);
  }
}

function terminateStockfish() {
  if (stockfishWorker.value) {
    stockfishWorker.value.terminate();
    stockfishWorker.value = null;
    stockfishReady.value = false;
    stockfishMoveResolver.value = null;
  }

  if (stockfishReadyResolver.value) {
    stockfishReadyResolver.value();
    stockfishReadyResolver.value = null;
  }
}

function onStockfishMessage(event) {
  const text = String(event.data || '').trim();
  if (!text) {
    return;
  }

  if (text === 'uciok' || text === 'readyok') {
    stockfishReady.value = true;
    if (stockfishReadyResolver.value) {
      stockfishReadyResolver.value();
      stockfishReadyResolver.value = null;
    }
    return;
  }

  if (text.startsWith('bestmove')) {
    const [, bestmove] = text.split(' ');
    if (stockfishMoveResolver.value) {
      stockfishMoveResolver.value(bestmove);
      stockfishMoveResolver.value = null;
    }
  }
}

function sendStockfishCommand(command) {
  if (!stockfishWorker.value) {
    return;
  }
  stockfishWorker.value.postMessage(command);
}

async function getBestMoveWithStockfish(fen) {
  if (!stockfishWorker.value) {
    return null;
  }

  if (!stockfishReady.value) {
    if (stockfishReadyPromise.value) {
      await stockfishReadyPromise.value;
    }
  }

  if (!stockfishReady.value) {
    return null;
  }

  if (stockfishMoveResolver.value) {
    stockfishMoveResolver.value(null);
    stockfishMoveResolver.value = null;
  }

  return new Promise((resolve) => {
    stockfishMoveResolver.value = resolve;
    sendStockfishCommand(`position fen ${fen}`);
    sendStockfishCommand(`go movetime ${engineTiming[props.difficulty] || 500}`);
  });
}

function refreshBoardState() {
  currentTurn.value = chess.turn();
  history.value = chess.history();
  const rows = [];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const isBlackPerspective = actualUserColor.value === 'black';

  const rankOrder = isBlackPerspective ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileOrder = isBlackPerspective ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  for (const rank of rankOrder) {
    for (const file of fileOrder) {
      const square = `${file}${rank}`;
      const piece = chess.get(square);
      rows.push({ square, pieceSymbol: piece ? symbolForPiece(piece) : '', piece });
    }
  }

  boardSquares.value = rows;
}

const statusMessage = computed(() => {
  if (finished.value) {
    return resultTag.value === 'win'
      ? 'Game over — you won!'
      : resultTag.value === 'loss'
      ? 'Game over — you lost.'
      : 'Game over — draw.';
  }
  const turn = currentTurn.value === 'w' ? 'White' : 'Black';
  const isUserTurn =
    (actualUserColor.value === 'white' && turn === 'White') ||
    (actualUserColor.value === 'black' && turn === 'Black');
  return isUserTurn ? 'Your move.' : 'Bot thinking...';
});

const gameResultText = computed(() => {
  if (!finished.value) {
    return 'In progress';
  }
  return resultTag.value === 'win' ? 'Victory' : resultTag.value === 'loss' ? 'Defeat' : 'Draw';
});

const endTitle = computed(() => {
  if (!finished.value) {
    return '';
  }
  return resultTag.value === 'win' ? 'Victory!' : resultTag.value === 'loss' ? 'Defeat' : 'Draw';
});

const endSubtitle = computed(() => {
  if (!finished.value) {
    return '';
  }
  return resultTag.value === 'win'
    ? 'You have beaten the bot.'
    : resultTag.value === 'loss'
    ? 'You resigned or were defeated.'
    : 'The game ended in a draw.';
});

const pointsChangeText = computed(() => {
  const change = pointsChange.value;
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return '0';
});

function symbolForPiece(piece) {
  const map = {
    p: '♙',
    r: '♖',
    n: '♘',
    b: '♗',
    q: '♕',
    k: '♔',
    P: '♟',
    R: '♜',
    N: '♞',
    B: '♝',
    Q: '♛',
    K: '♚',
  };
  return map[piece.color === 'w' ? piece.type.toUpperCase() : piece.type] || '';
}

function onSquareClick(square) {
  if (finished.value || !isUserTurn()) {
    return;
  }

  const piece = chess.get(square);
  if (selectedSquare.value && availableMoves.value.includes(square)) {
    tryMove(selectedSquare.value, square);
    return;
  }

  selectedSquare.value = '';
  availableMoves.value = [];

  if (piece && piece.color === (actualUserColor.value === 'white' ? 'w' : 'b')) {
    selectedSquare.value = square;
    availableMoves.value = chess.moves({ square, verbose: true }).map((move) => move.to);
  }
}

function tryMove(from, to) {
  const move = chess.move({ from, to, promotion: 'q' });
  if (move) {
    lastMove.value = [move.from, move.to];
    selectedSquare.value = '';
    availableMoves.value = [];
    refreshBoardState();
    evaluateBoardState();
    if (!chess.isGameOver()) {
      window.setTimeout(executeBotMove, 300);
    }
  }
}

function isUserTurn() {
  const turn = chess.turn();
  return actualUserColor.value === 'white' ? turn === 'w' : turn === 'b';
}

async function executeBotMove() {
  if (chess.isGameOver()) {
    evaluateBoardState();
    return;
  }

  const fen = chess.fen();
  const move = await getBestMoveWithStockfish(fen);
  if (!move) {
    evaluateBoardState();
    return;
  }

  makeBotMove(move);
}

function makeBotMove(move) {
  const appliedMove = typeof move === 'string'
    ? chess.move(move, { sloppy: true })
    : chess.move(move);

  if (appliedMove) {
    lastMove.value = [appliedMove.from, appliedMove.to];
    selectedSquare.value = '';
    availableMoves.value = [];
    refreshBoardState();
    evaluateBoardState();
  }
}

function evaluateMaterial(chessInstance) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const board = chessInstance.board();
  let score = 0;
  board.forEach((row) => {
    row.forEach((square) => {
      if (!square) return;
      const value = values[square.type] || 0;
      score += square.color === 'w' ? value : -value;
    });
  });
  return score;
}

function evaluateBoardState() {
  if (!chess.isGameOver()) {
    return;
  }

  finished.value = true;
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    resultTag.value = 'draw';
  } else {
    const whiteWon = chess.turn() === 'b';
    const userPlayingWhite = actualUserColor.value === 'white';

    if ((whiteWon && userPlayingWhite) || (!whiteWon && !userPlayingWhite)) {
      resultTag.value = 'win';
    } else {
      resultTag.value = 'loss';
    }
  }

  if (isAuthenticated) {
    autoSaveGame();
  }
}

async function autoSaveGame() {
  const payload = {
    pgn: chess.pgn(),
    result: resultTag.value,
    difficulty: props.difficulty,
    userColor: actualUserColor.value,
  };

  const response = await userStore.saveGame(payload);
  if (response && response._id) {
    savedGameId.value = response._id;
  }

  const afterPoints = userStore.user?.points ?? pointsBeforeGame.value;
  pointsChange.value = afterPoints - pointsBeforeGame.value;
}

async function resignGame() {
  if (finished.value) {
    return;
  }

  finished.value = true;
  resultTag.value = 'loss';
  refreshBoardState();

  if (isAuthenticated) {
    await autoSaveGame();
  }
}

function reviewSavedGame() {
  if (savedGameId.value) {
    router.push(`/games/${savedGameId.value}`);
    return;
  }
  router.push('/games');
}

function startNewGame() {
  resetGame();
}

function resetGame() {
  chess.reset();
  selectedSquare.value = '';
  availableMoves.value = [];
  lastMove.value = [];
  finished.value = false;
  resultTag.value = '';
  savedGameId.value = null;
  pointsChange.value = 0;
  pointsBeforeGame.value = userStore.user?.points ?? 0;

  if (props.userColor === 'random') {
    actualUserColor.value = Math.random() < 0.5 ? 'white' : 'black';
  } else {
    actualUserColor.value = props.userColor;
  }

  refreshBoardState();

  if (actualUserColor.value === 'black') {
    window.setTimeout(executeBotMove, 300);
  }
}

onMounted(() => {
  initStockfish();
  resetGame();
});

onBeforeUnmount(() => {
  terminateStockfish();
});
</script>
