import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/destinations',
    name: 'Destinations',
    component: () => import('../views/Destinations.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/itinerary',
    name: 'Itinerary',
    component: () => import('../views/Itinerary.vue')
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('../views/Guide.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/News.vue')
  },
  {
    path: '/itinerary-detail',
    name: 'ItineraryDetail',
    component: () => import('../views/ItineraryDetail.vue')
  },
  {
    path: '/guide-detail',
    name: 'GuideDetail',
    component: () => import('../views/GuideDetail.vue')
  },
  {
    path: '/news-detail',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetail.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAdminAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'destinations',
        name: 'DestinationList',
        component: () => import('../views/admin/DestinationList.vue')
      },
      {
        path: 'destinations/create',
        name: 'DestinationCreate',
        component: () => import('../views/admin/DestinationEdit.vue')
      },
      {
        path: 'destinations/:id/edit',
        name: 'DestinationEdit',
        component: () => import('../views/admin/DestinationEdit.vue')
      },
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('../views/admin/UserManage.vue')
      },
      {
        path: 'reviews',
        name: 'ReviewManage',
        component: () => import('../views/admin/ReviewManage.vue')
      },
      {
        path: 'tags',
        name: 'TagManage',
        component: () => import('../views/admin/TagManage.vue')
      },
      {
        path: 'itineraries',
        name: 'ItineraryManage',
        component: () => import('../views/admin/ItineraryManage.vue')
      },
      {
        path: 'guides',
        name: 'GuideManage',
        component: () => import('../views/admin/GuideManage.vue')
      },
      {
        path: 'news',
        name: 'NewsManage',
        component: () => import('../views/admin/NewsManage.vue')
      }
    ]
  },
  {
    path: '/guide-edit',
    name: 'GuideEdit',
    component: () => import('../views/GuideEdit.vue'),
    meta: { requiresUserAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresUserAuth && !authStore.isUserLoggedIn) {
    next('/')
  } else if (to.meta.requiresAdminAuth && !authStore.isAdminLoggedIn) {
    next('/admin/login')
  } else if (to.path === '/admin/login' && authStore.isAdminLoggedIn) {
    next('/admin')
  } else {
    next()
  }
})

export default router
