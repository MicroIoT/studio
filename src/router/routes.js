
const routes = [
  {
    path: '/',
    component: () => import('layouts/Login.vue')
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',
        component: () => import('pages/Index.vue')
      },
      { path: 'site/:parentId',
        component: () => import('pages/site/Sites.vue'),
        meta: {
          keepAlive: true
        }
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
