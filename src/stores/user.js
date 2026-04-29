import { defineStore } from 'pinia';
import api from '../api/http';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('chess-success-token') || '',
    user: null,
    games: [],
    leaderboard: [],
    loading: false,
    error: '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    pointsLabel: (state) => (state.user ? `${state.user.points} pts` : '0 pts'),
  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('chess-success-token', token);
    },
    clearAuth() {
      this.token = '';
      this.user = null;
      this.games = [];
      localStorage.removeItem('chess-success-token');
    },
    async login(credentials) {
      this.loading = true;
      this.error = '';
      try {
        const response = await api.post('/auth/login', credentials);
        this.setToken(response.data.token);
        this.user = response.data.user;
        return true;
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async register(credentials) {
      this.loading = true;
      this.error = '';
      try {
        await api.post('/auth/register', credentials);
        return true;
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.clearAuth();
    },
    async fetchProfile() {
      if (!this.token) return;
      this.loading = true;
      try {
        const response = await api.get('/users/me');
        this.user = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Unable to fetch profile';
      } finally {
        this.loading = false;
      }
    },
    async fetchLeaderboard() {
      this.loading = true;
      try {
        const response = await api.get('/users/leaderboard');
        this.leaderboard = response.data.leaderboard || [];
      } catch (error) {
        this.error = error.response?.data?.error || 'Unable to fetch leaderboard';
      } finally {
        this.loading = false;
      }
    },
    async fetchGames() {
      if (!this.token) return;
      this.loading = true;
      try {
        const response = await api.get('/games');
        this.games = response.data.games || [];
      } catch (error) {
        this.error = error.response?.data?.error || 'Unable to load games';
      } finally {
        this.loading = false;
      }
    },
    async fetchGameById(gameId) {
      if (!this.token) return null;
      this.loading = true;
      try {
        const response = await api.get(`/games/${gameId}`);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Unable to load game';
        return null;
      } finally {
        this.loading = false;
      }
    },
    async saveGame(payload) {
      if (!this.token) {
        this.error = 'You must be logged in to save games.';
        return false;
      }
      this.loading = true;
      this.error = '';
      try {
        await api.post('/games', payload);
        await this.fetchProfile();
        await this.fetchGames();
        return true;
      } catch (error) {
        this.error = error.response?.data?.error || 'Unable to save game';
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
