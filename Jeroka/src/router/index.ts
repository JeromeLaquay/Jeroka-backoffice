import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/politique-confidentialite',
    name: 'privacy',
    component: () => import('../views/PrivacyView.vue')
  },
  {
    path: '/mentions-legales',
    name: 'legal',
    component: () => import('../views/LegalView.vue')
  },
  {
    path: '/politique-cookies',
    name: 'cookies',
    component: () => import('../views/CookiesView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0 }
  }
})

export default router 