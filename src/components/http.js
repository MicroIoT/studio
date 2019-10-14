import axios from 'axios'
import store from '../store'
import { Loading, Notify } from 'quasar'

export function http (type, url, params, callback, refresh) {
  return new Promise(function (resolve, reject) {
    refresh = typeof refresh !== 'undefined' ? refresh : false
    let client = axios.create({
      baseURL: store.getters.getHttp + store.getters.getServer,
      withCredentials: true
    })
    client.interceptors.request.use(
      (config) => {
        let token = store.getters.getToken
        if (token && !refresh) {
          let t = token.token
          config.headers['Authorization'] = `Bearer ${t}`
        } else if (token && refresh) {
          let t = token.refreshToken
          config.headers['Authorization'] = `Bearer ${t}`
        }
        return config
      }
    )
    Loading.show()
    let method
    if (type === 'post') {
      method = client.post
    } else if (type === 'get') {
      method = client.get
    } else if (type === 'patch') {
      method = client.patch
    } else if (type === 'delete') {
      method = client.delete
    }
    method(url, params)
      .then((response) => {
        Loading.hide()
        callback(response)
      })
      .catch((error) => {
        let errorMsg
        Loading.hide()

        if (error.response) {
          if (error.response.data.message) {
            errorMsg = error.response.data.message
          } else {
            errorMsg = error.response.data
          }
        } else {
          errorMsg = error.message
        }
        if (error.response && error.response.status === 401 && url !== '/login') {
          http('get', '/token', null, (response) => {
            store.commit('token', response.data)
            http(type, url, params, callback)
          }, true)
        } else {
          Notify.create({
            message: errorMsg
          })
        }
      })
  })
}
