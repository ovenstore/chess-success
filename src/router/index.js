import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import PlayView from '../views/PlayView.vue';
import GamesView from '../views/GamesView.vue';
import GameReviewView from '../views/GameReviewView.vue';
import LeaderboardView from '../views/LeaderboardView.vue';
import { useUserStore } from '../stores/user';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: LoginView, meta: { guest: true } },
  { path: '/register', component: RegisterView, meta: { guest: true } },
  { path: '/dashboard', component: DashboardView, meta: { auth: true } },
  { path: '/play', component: PlayView, meta: { auth: true } },
  { path: '/games', component: GamesView, meta: { auth: true } },
  { path: '/games/:id', component: GameReviewView, meta: { auth: true } },
  { path: '/leaderboard', component: LeaderboardView } ,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.auth) {
    if (!userStore.token) {
      return next('/login');
    }
    // If user not loaded, try to fetch profile to validate token
    if (!userStore.user) {
      try {
        await userStore.fetchProfile();
      } catch {
        userStore.clearAuth();
        return next('/login');
      }
    }
    if (!userStore.user) {
      return next('/login');
    }
  }
  if (to.meta.guest && userStore.isAuthenticated) {
    return next('/dashboard');
  }
  next();
});

export default router;
