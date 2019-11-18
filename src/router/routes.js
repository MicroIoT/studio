
const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('layouts/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('layouts/Register.vue')
  },
  {
    path: '/register/:email',
    name: 'register1',
    component: () => import('layouts/Register.vue')
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
        path: 'sites/:parentId/addsite',
        name: 'addsite',
        component: () => import('pages/site/AddSite.vue')
      },
      {
        path: 'sites/:parentId/adddevice',
        name: 'adddevice',
        component: () => import('pages/site/AddDevice.vue')
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
        path: 'sites/:parentId/action/:id/:action',
        name: 'action',
        component: () => import('pages/site/Action.vue')
      },
      {
        path: 'sites/:parentId/events/:id/:attribute',
        name: 'events',
        component: () => import('pages/site/Events.vue')
      },
      { path: 'alarms',
        name: 'alarms',
        component: () => import('pages/alarm/Alarms.vue')
      },
      {
        path: 'alarms/alarm/:id/:type',
        name: 'alarm',
        component: () => import('pages/alarm/Alarm.vue')
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
      {
        path: 'devicetypes/adddevicetype',
        name: 'adddevicetype',
        component: () => import('pages/configuration/AddDeviceType.vue')
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
      {
        path: 'sitetypes/addsitetype',
        name: 'addsitetype',
        component: () => import('pages/configuration/AddSiteType.vue')
      },
      { path: 'domains',
        name: 'domains',
        component: () => import('pages/domain/Domains.vue')
      },
      { path: 'users',
        name: 'users',
        component: () => import('pages/user/Users.vue')
      },
      {
        path: 'users/user/:username',
        name: 'user',
        component: () => import('pages/user/User.vue')
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
