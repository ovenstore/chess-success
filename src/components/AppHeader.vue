<template>
  <header class="app-header">
    <div class="brand">
      <span class="brand-mark">♟</span>
      <div>
        <h1>Chess Success</h1>
        <p>Win points. Save progress. Review games.</p>
      </div>
    </div>

    <nav class="nav-links">
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/play">Play</router-link>
      <router-link to="/games">Saved Games</router-link>
      <router-link to="/leaderboard">Leaderboard</router-link>
    </nav>

    <div class="header-actions">
      <template v-if="isAuthenticated">
        <span class="user-chip">{{ user?.username || 'Player' }}</span>
        <button type="button" class="ghost-button" @click="logout">Logout</button>
      </template>
      <template v-else>
        <router-link class="ghost-button" to="/login">Login</router-link>
        <router-link class="ghost-button" to="/register">Register</router-link>
      </template>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const { user, token } = storeToRefs(userStore);
const isAuthenticated = computed(() => !!token.value);
const router = useRouter();

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>
