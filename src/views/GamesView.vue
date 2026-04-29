<template>
  <section class="page-card">
    <h1 class="section-title">Saved games</h1>
    <p class="subtitle">Saved matches are stored on your backend profile.</p>

    <div class="table-panel">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Result</th>
            <th>Difficulty</th>
            <th>Moves</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in userStore.games" :key="game._id">
            <td>{{ formatDate(game.createdAt) }}</td>
            <td><span :class="['badge', resultClass(game.result)]">{{ game.result }}</span></td>
            <td>{{ game.difficulty }}</td>
            <td>{{ moveCount(game.pgn) }}</td>
            <td><button class="ghost-button" @click="viewGame(game._id)">Open</button></td>
          </tr>
          <tr v-if="userStore.games.length === 0">
            <td colspan="5">No games saved yet. Play a match to get started.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const router = useRouter();

onMounted(async () => {
  await userStore.fetchGames();
});

const viewGame = (id) => {
  router.push(`/games/${id}`);
};

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');
const moveCount = (pgn) => (pgn ? pgn.split(' ').length - 1 : 0);
const resultClass = (result) => {
  return result === 'win' ? 'tag-win' : result === 'loss' ? 'tag-loss' : 'tag-draw';
};
</script>
