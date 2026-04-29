<template>
  <section class="page-card">
    <h1 class="section-title">Leaderboard</h1>
    <p class="subtitle">Top players by total points.</p>

    <div class="table-panel">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Points</th>
            <th>Games</th>
            <th>Wins / Losses / Draws</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in leaderboard" :key="player._id">
            <td>{{ index + 1 }}</td>
            <td>{{ player.username }}</td>
            <td>{{ player.points }}</td>
            <td>{{ player.gamesPlayed }}</td>
            <td>{{ player.easyWins + player.mediumWins + player.hardWins }}W / {{ player.easyLosses + player.mediumLosses + player.hardLosses }}L / {{ player.easyDraws + player.mediumDraws + player.hardDraws }}D</td>
          </tr>
          <tr v-if="leaderboard.length === 0">
            <td colspan="5">Leaderboard is empty. Invite players to join!</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const leaderboard = computed(() => userStore.leaderboard);

onMounted(async () => {
  await userStore.fetchLeaderboard();
});
</script>
