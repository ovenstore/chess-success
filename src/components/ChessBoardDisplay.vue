<template>
  <div class="board-grid">
    <div
      v-for="square in board"
      :key="square.square"
      :class="squareClasses(square)"
      @click="$emit('square-click', square.square)"
    >
      <span>{{ square.pieceSymbol }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  board: { type: Array, default: () => [] },
  selected: { type: String, default: '' },
  availableMoves: { type: Array, default: () => [] },
  lastMove: { type: Array, default: () => [] },
});

defineEmits(['square-click']);

const isDarkSquare = (square) => {
  const file = square[0].charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 0;
};

const squareClasses = (square) => {
  return [
    'board-square',
    isDarkSquare(square.square) ? 'dark' : 'light',
    props.selected === square.square ? 'highlight' : '',
    props.availableMoves.includes(square.square) ? 'capture' : '',
    props.lastMove.includes(square.square) ? 'last-move' : '',
  ];
};
</script>
