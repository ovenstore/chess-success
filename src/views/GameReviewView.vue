<template>
  <section class="page-card" v-if="game">
    <h1 class="section-title">Review match</h1>
    <p class="subtitle">Step through your saved board position move by move.</p>

    <div class="board-frame">
      <div class="board-grid">
        <div
          v-for="square in boardSquares"
          :key="square.square"
          :class="squareClasses(square)"
        >
          <span>{{ square.pieceSymbol }}</span>
        </div>
      </div>
    </div>

    <div class="review-controls">
      <button class="ghost-button" type="button" @click="jumpTo(0)">Start</button>
      <button class="ghost-button" type="button" @click="stepBackward" :disabled="step === 0">Back</button>
      <span class="badge">Step {{ step }} / {{ moveCount }}</span>
      <button class="ghost-button" type="button" @click="stepForward" :disabled="step >= moveCount">Next</button>
      <button class="ghost-button" type="button" @click="jumpTo(moveCount)">End</button>
    </div>

    <div class="page-card" style="margin-top: 1.25rem;">
      <dl>
        <dt><strong>Result</strong></dt>
        <dd><span :class="['badge', resultClass(game.result)]">{{ game.result }}</span></dd>
        <dt><strong>Difficulty</strong></dt>
        <dd><span class="badge">{{ game.difficulty }}</span></dd>
        <dt><strong>Saved</strong></dt>
        <dd>{{ formatDate(game.createdAt) }}</dd>
      </dl>
    </div>
  </section>

  <section class="page-card" v-else>
    <p>Loading game review...</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Chess } from 'chess.js';
import { useUserStore } from '../stores/user';

const route = useRoute();
const userStore = useUserStore();
const game = ref(null);
const chess = new Chess();
const step = ref(0);
const boardSquares = ref([]);
const allMoves = ref([]);

const loadGame = async () => {
  game.value = await userStore.fetchGameById(route.params.id);
  if (game.value) {
    chess.reset();
    chess.loadPgn(game.value.pgn || '');
    allMoves.value = chess.history();
    chess.reset();
    step.value = 0;
    updateBoard();
  }
};

const moveCount = computed(() => allMoves.value.length);

onMounted(loadGame);

const updateBoard = () => {
  chess.reset();
  const applied = allMoves.value.slice(0, step.value);
  applied.forEach((move) => {
    chess.move(move, { sloppy: true });
  });

  const isBlackPerspective = game.value?.userColor === 'black';
  const rankOrder = isBlackPerspective ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileOrder = isBlackPerspective ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const squares = [];
  for (const rank of rankOrder) {
    for (const file of fileOrder) {
      const square = `${file}${rank}`;
      const piece = chess.get(square);
      squares.push({ square, pieceSymbol: piece ? symbolForPiece(piece) : '' });
    }
  }
  boardSquares.value = squares;
};

const symbolForPiece = (piece) => {
  const map = { P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚', p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' };
  return map[piece.color === 'w' ? piece.type.toUpperCase() : piece.type] || '';
};

const squareClasses = (square) => {
  const file = square.square[0].charCodeAt(0) - 97;
  const rank = Number(square.square[1]);
  return ['board-square', (file + rank) % 2 === 0 ? 'dark' : 'light'];
};

const stepForward = () => {
  if (step.value < moveCount.value) {
    step.value += 1;
    updateBoard();
  }
};

const stepBackward = () => {
  if (step.value > 0) {
    step.value -= 1;
    updateBoard();
  }
};

const jumpTo = (value) => {
  step.value = value;
  updateBoard();
};

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');
const resultClass = (result) => (result === 'win' ? 'tag-win' : result === 'loss' ? 'tag-loss' : 'tag-draw');
</script>
