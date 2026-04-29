<template>
  <section class="page-card">
    <h1 class="section-title">Play against the bot</h1>
    <p class="subtitle">White starts first. Save the match after the game ends.</p>
    <div class="chess-panel">
      <GameSetup v-if="!gameStarted" @start-game="startGame" />
      <ChessPlayBoard v-else :difficulty="difficulty" :userColor="userColor" />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import GameSetup from '../components/GameSetup.vue';
import ChessPlayBoard from '../components/ChessPlayBoard.vue';

const route = useRoute();
const gameStarted = ref(false);
const difficulty = ref('easy');
const userColor = ref('white');

onMounted(() => {
  const queryDifficulty = route.query.difficulty;
  const queryColor = route.query.color;
  if (queryDifficulty && queryColor) {
    difficulty.value = queryDifficulty;
    userColor.value = queryColor;
    gameStarted.value = true;
  }
});

const startGame = (settings) => {
  difficulty.value = settings.difficulty;
  userColor.value = settings.color;
  gameStarted.value = true;
};
</script>
