<template>
  <section class="page-card">
    <h1 class="section-title">Create an account</h1>
    <p class="subtitle">Register once and keep your match history safe.</p>

    <form @submit.prevent="submitRegister">
      <div class="form-field">
        <label for="username">Username</label>
        <input id="username" v-model="form.username" type="text" autocomplete="username" required />
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" autocomplete="new-password" required minlength="6" />
      </div>
      <div class="form-actions">
        <button class="cta-button" type="submit" :disabled="loading">Register</button>
        <router-link to="/login" class="ghost-button">Already have an account</router-link>
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

const submitRegister = async () => {
  const success = await userStore.register({ username: form.username.trim(), password: form.password });
  if (success) {
    router.push('/login');
  }
};
</script>
