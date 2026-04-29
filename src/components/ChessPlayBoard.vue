<template>
  <section class="page-card chess-panel">
    <div class="board-frame">
      <ChessBoardDisplay
        :board="boardSquares"
        :selected="selectedSquare"
        :availableMoves="availableMoves"
        :lastMove="lastMove"
        :onSquareClick="onSquareClick"
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
        <button class="cta-button" type="button" @click="resetGame">Reset board</button>
        <button
          class="cta-button"
          type="button"
          :disabled="!finished || saving || !isAuthenticated"
          @click="saveGame"
        >
          Save game to profile
        </button>
      </div>

      <div v-if="saveMessage" class="alert" :class="{ 'alert-danger': saveError }">
        {{ saveMessage }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { Chess } from 'chess.js';
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import ChessBoardDisplay from './ChessBoardDisplay.vue';
import { useUserStore } from '../stores/user';
import stockfishWorkerUrl from '../../stockfish-18-lite-single.js?url';

const props = defineProps({
  difficulty: { type: String, default: 'easy' },
  userColor: { type: String, default: 'white' },
});

const userStore = useUserStore();
const isAuthenticated = userStore.isAuthenticated;
const game = reactive({ instance: new Chess() });
const selectedSquare = ref('');
const availableMoves = ref([]);
const lastMove = ref([]);
const finished = ref(false);
const resultTag = ref('');
const saveMessage = ref('');
const saveError = ref(false);
const saving = ref(false);
const actualUserColor = ref(props.userColor);

const stockfishWorker = ref(null);
const stockfishReady = ref(false);
const stockfishReadyPromise = ref(null);
const stockfishReadyResolver = ref(null);
const stockfishMoveResolver = ref(null);
const engineTiming = {
  easy: 300,
  medium: 800,
  hard: 1500,
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

const boardSquares = computed(() => {
  const rows = [];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  for (let rank = 8; rank >= 1; rank -= 1) {
    for (const file of files) {
      const square = `${file}${rank}`;
      const piece = game.instance.get(square);
      rows.push({ square, pieceSymbol: piece ? symbolForPiece(piece) : '', piece });
    }
  }

  return rows;
});

const history = computed(() => game.instance.history());

const statusMessage = computed(() => {
  if (finished.value) {
    return 'Game finished. Save your match or reset to play again.';
  }
  const turn = game.instance.turn() === 'w' ? 'White' : 'Black';
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

function symbolForPiece(piece) {
  const map = {
    p: '♟',
    r: '♜',
    n: '♞',
    b: '♝',
    q: '♛',
    k: '♚',
    P: '♙',
    R: '♖',
    N: '♘',
    B: '♗',
    Q: '♕',
    K: '♔',
  };
  return map[piece.color === 'w' ? piece.type.toUpperCase() : piece.type] || '';
}

function onSquareClick(square) {
  if (finished.value || !isUserTurn()) {
    return;
  }

  const piece = game.instance.get(square);
  if (selectedSquare.value && availableMoves.value.includes(square)) {
    tryMove(selectedSquare.value, square);
    return;
  }

  selectedSquare.value = '';
  availableMoves.value = [];

  if (piece && piece.color === (actualUserColor.value === 'white' ? 'w' : 'b')) {
    selectedSquare.value = square;
    availableMoves.value = game.instance.moves({ square, verbose: true }).map((move) => move.to);
  }
}

function tryMove(from, to) {
  const move = game.instance.move({ from, to, promotion: 'q' });
  if (move) {
    lastMove.value = [move.from, move.to];
    selectedSquare.value = '';
    availableMoves.value = [];
    evaluateBoardState();
    if (!game.instance.isGameOver()) {
      window.setTimeout(executeBotMove, 300);
    }
  }
}

function isUserTurn() {
  const turn = game.instance.turn();
  return actualUserColor.value === 'white' ? turn === 'w' : turn === 'b';
}

async function executeBotMove() {
  if (game.instance.isGameOver()) {
    evaluateBoardState();
    return;
  }

  const fen = game.instance.fen();
  const move = await getBestMoveWithStockfish(fen);
  if (!move) {
    evaluateBoardState();
    return;
  }

  makeBotMove(move);
}

function makeBotMove(move) {
  const appliedMove = typeof move === 'string'
    ? game.instance.move(move, { sloppy: true })
    : game.instance.move(move);

  if (appliedMove) {
    lastMove.value = [appliedMove.from, appliedMove.to];
  }
  selectedSquare.value = '';
  availableMoves.value = [];
  evaluateBoardState();
}

function evaluateMaterial(chess) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const board = chess.board();
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
  if (!game.instance.isGameOver()) {
    return;
  }

  finished.value = true;
  if (game.instance.isDraw() || game.instance.isStalemate() || game.instance.isThreefoldRepetition() || game.instance.isInsufficientMaterial()) {
    resultTag.value = 'draw';
  } else if (game.instance.turn() === 'w') {
    resultTag.value = 'loss';
  } else {
    resultTag.value = 'win';
  }
}

async function saveGame() {
  if (!isAuthenticated) {
    saveMessage.value = 'Log in to save a game.';
    saveError.value = true;
    return;
  }

  if (!finished.value) {
    saveMessage.value = 'Finish the game before saving.';
    saveError.value = true;
    return;
  }

  saving.value = true;
  saveError.value = false;
  const payload = {
    pgn: game.instance.pgn(),
    result: resultTag.value,
    difficulty: props.difficulty,
  };

  const ok = await userStore.saveGame(payload);
  if (ok) {
    saveMessage.value = 'Game saved successfully.';
    saveError.value = false;
  } else {
    saveMessage.value = userStore.error || 'Could not save game.';
    saveError.value = true;
  }
  saving.value = false;
}

function resetGame() {
  game.instance = new Chess();
  selectedSquare.value = '';
  availableMoves.value = [];
  lastMove.value = [];
  finished.value = false;
  resultTag.value = '';
  saveMessage.value = '';
  saveError.value = false;

  if (props.userColor === 'random') {
    actualUserColor.value = Math.random() < 0.5 ? 'white' : 'black';
  } else {
    actualUserColor.value = props.userColor;
  }

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
