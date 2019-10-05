import { Notify } from 'quasar'

Notify.setDefaults({
  position: 'bottom',
  timeout: 10000,
  color: 'red',
  actions: [{ icon: 'close', color: 'white' }]
})
