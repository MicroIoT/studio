import axios from 'axios'
import store from '../store'
import { Loading, Notify } from 'quasar'

export function http (type, url, params, callback, refresh, showLoading) {
  return new Promise(function (resolve, reject) {
    refresh = typeof refresh !== 'undefined' ? refresh : false
    showLoading = typeof showLoading !== 'undefined' ? showLoading : true
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
    if (showLoading) {
      Loading.show()
    }
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
        if (showLoading) {
          Loading.hide()
        }
        callback(response)
      })
      .catch((error) => {
        let errorMsg
        if (showLoading) {
          Loading.hide()
        }

        if (error.response) {
          if (error.response.data.message) {
            errorMsg = error.response.data.message
          } else {
            errorMsg = error.response.data
          }
        } else {
          errorMsg = error.message
        }
        if (error.response && error.response.status === 401 && url !== '/login' && !refresh) {
          if (error.response.data === 'JWT Token not exist') {
            Notify.create({
              message: 'token不存在，请重新登录！'
            })
          } else {
            http('get', '/token', null, (response) => {
              if (!response) {
                Notify.create({
                  message: 'token过期，请重新登录！'
                })
              } else {
                store.commit('token', response.data)
                http(type, url, params, callback)
              }
            }, true)
          }
        } else if (refresh) {
          var response = false
          callback(response)
        } else {
          Notify.create({
            message: errorMsg
          })
        }
      })
  })
}
