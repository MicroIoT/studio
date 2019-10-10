
const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('layouts/Login.vue')
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',
        name: 'home',
        component: () => import('pages/Index.vue')
      },
      { path: 'sites/:parentId',
        name: 'sites',
        component: () => import('pages/site/Sites.vue')
      },
      {
        path: 'sites/:parentId/site/:id',
        name: 'site',
        component: () => import('pages/site/Site.vue')
      },
      {
        path: 'sites/:parentId/device/:id',
        name: 'device',
        component: () => import('pages/site/Device.vue')
      },
      {
        path: 'sites/:parentId/get/:id/:attribute',
        name: 'get',
        component: () => import('pages/site/Get.vue')
      },
      {
        path: 'sites/:parentId/set/:id/:attribute',
        name: 'set',
        component: () => import('pages/site/Set.vue')
      },
      {
        path: 'sites/:parentId/events/:id/:attribute',
        name: 'events',
        component: () => import('pages/site/Events.vue')
      },
      { path: 'devicegroups',
        name: 'devicegroups',
        component: () => import('pages/configuration/DeviceGroups.vue')
      },
      {
        path: 'devicegroups/devicegroup/:id',
        name: 'devicegroup',
        component: () => import('pages/configuration/DeviceGroup.vue')
      },
      { path: 'devicetypes',
        name: 'devicetypes',
        component: () => import('pages/configuration/DeviceTypes.vue')
      },
      {
        path: 'devicetypes/devicetype/:id',
        name: 'devicetype',
        component: () => import('pages/configuration/DeviceType.vue')
      },
      { path: 'sitetypes',
        name: 'sitetypes',
        component: () => import('pages/configuration/SiteTypes.vue')
      },
      {
        path: 'sitetypes/sitetype/:id',
        name: 'sitetype',
        component: () => import('pages/configuration/SiteType.vue')
      },
      { path: 'users',
        name: 'users',
        component: () => import('pages/user/Users.vue')
      },
      { path: 'favorites',
        name: 'favorites',
        component: () => import('pages/favorite/Favorites.vue')
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
