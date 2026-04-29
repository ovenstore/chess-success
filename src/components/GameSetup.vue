<template>
  <section class="page-card">
    <h1 class="section-title">Game Setup</h1>
    <p class="subtitle">Choose your difficulty and color before starting.</p>

    <form @submit.prevent="startGame">
      <div class="form-field">
        <label for="difficulty">Difficulty</label>
        <select id="difficulty" v-model="difficulty" required>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div class="form-field">
        <label for="color">Your Color</label>
        <select id="color" v-model="color" required>
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="random">Random</option>
        </select>
      </div>

      <div class="form-actions">
        <button class="cta-button" type="submit">Start Game</button>
        <router-link to="/dashboard" class="ghost-button">Back to Dashboard</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['start-game']);
const difficulty = ref('easy');
const color = ref('white');

const startGame = () => {
  emit('start-game', { difficulty: difficulty.value, color: color.value });
};
</script>
