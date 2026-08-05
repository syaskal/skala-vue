import { createRouter, createWebHashHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'
import WeatherDetailView from '../views/WeatherDetailView.vue'
const routes = [
  {
    path: '/',
    name: 'WeatherHome',
    component: WeatherHomeView,
  },
  {
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    path: '/weather',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
  {
    path: '/weatherDashboard',
    name: 'WeatherDashboard',
    component: () => import('../views/WeatherDashboardView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
