<template>
  <section class="page-card">
    <h1 class="section-title">Welcome back, {{ user.username }}</h1>
    <p class="subtitle">Track points, review recent games, and challenge the bot.</p>

    <div class="stat-grid">
      <div class="stat-card">
        <strong>{{ user?.points ?? 0 }}</strong>
        <span>Points</span>
      </div>
      <div class="stat-card">
        <strong>{{ user?.gamesPlayed ?? 0 }}</strong>
        <span>Games played</span>
      </div>
      <div class="stat-card">
        <strong>{{ easyScore }}</strong>
        <span>Easy record</span>
      </div>
      <div class="stat-card">
        <strong>{{ mediumScore }}</strong>
        <span>Medium record</span>
      </div>
      <div class="stat-card">
        <strong>{{ hardScore }}</strong>
        <span>Hard record</span>
      </div>
    </div>

    <div class="page-card" style="margin-top: 1.5rem;">
      <h2 class="section-title">Quick actions</h2>
      <div class="grid-columns columns-3">
        <button class="cta-button" type="button" @click="navigate('/play')">Play a new match</button>
        <button class="cta-button" type="button" @click="navigate('/games')">Review saved games</button>
        <button class="cta-button" type="button" @click="navigate('/leaderboard')">View leaderboard</button>
      </div>
    </div>

    <div class="page-card" style="margin-top: 1.5rem;">
      <h2 class="section-title">Recent saved games</h2>
      <div class="table-panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Result</th>
              <th>Difficulty</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in recentGames" :key="game._id">
              <td>{{ formatDate(game.createdAt) }}</td>
              <td><span :class="['badge', resultClass(game.result)]">{{ game.result }}</span></td>
              <td>{{ game.difficulty }}</td>
              <td><button class="ghost-button" @click="navigate(`/games/${game._id}`)">Open</button></td>
            </tr>
            <tr v-if="recentGames.length === 0">
              <td colspan="4">No saved games yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const router = useRouter();
const user = computed(() => userStore.user);

onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchProfile();
  }
  await userStore.fetchGames();
});

const recentGames = computed(() => (userStore.games || []).slice(0, 5));
const easyScore = computed(() => `${user.value?.easyWins ?? 0}W • ${user.value?.easyLosses ?? 0}L • ${user.value?.easyDraws ?? 0}D`);
const mediumScore = computed(() => `${user.value?.mediumWins ?? 0}W • ${user.value?.mediumLosses ?? 0}L • ${user.value?.mediumDraws ?? 0}D`);
const hardScore = computed(() => `${user.value?.hardWins ?? 0}W • ${user.value?.hardLosses ?? 0}L • ${user.value?.hardDraws ?? 0}D`);

const navigate = (path) => router.push(path);

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const resultClass = (result) => {
  return result === 'win' ? 'tag-win' : result === 'loss' ? 'tag-loss' : 'tag-draw';
};
</script>
