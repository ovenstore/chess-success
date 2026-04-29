<template>
  <section class="page-card">
    <h1 class="section-title">Login to Chess Success</h1>
    <p class="subtitle">Use your username and password to continue.</p>

    <form @submit.prevent="submitLogin">
      <div class="form-field">
        <label for="username">Username</label>
        <input id="username" v-model="form.username" type="text" autocomplete="username" required />
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" autocomplete="current-password" required />
      </div>
      <div class="form-actions">
        <button class="cta-button" type="submit" :disabled="loading">Login</button>
        <router-link to="/register" class="ghost-button">Create account</router-link>
      </div>
    </form>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const { loading, error } = storeToRefs(userStore);
const router = useRouter();
const form = reactive({ username: '', password: '' });

const submitLogin = async () => {
  const success = await userStore.login({ username: form.username.trim(), password: form.password });
  if (success) {
    await userStore.fetchProfile();
    router.push('/dashboard');
  }
};
</script>
