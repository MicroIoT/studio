import { Stomp } from '@stomp/stompjs'
import store from '../store'
import { http } from './http'
import { Loading, Notify } from 'quasar'

const alarmTopic = '/topic/alarm.'
class StompClient {
  constructor () {
    this.client = {}
    this.subscriptions = new Map()
  }
  connect () {
    let wsUrl = store.getters.getWs + store.getters.getServer + '/ws_iot'

    this.client = Stomp.client(wsUrl)
    this.client.reconnect_delay = 10000
    let token = store.getters.getToken.token
    let header = {
      'Authorization': `Bearer ${token}`
    }
    this.client.connect(header, () => {
      this.manageSubscription()
    }, (error) => {
      if (error) {
        http('get', '/token', null, (response) => {
          store.commit('token', response.data)
          let token = store.getters.getToken.token
          let header = {
            'Authorization': `Bearer ${token}`
          }
          this.client.connect(header, () => {
            this.manageSubscription()
          })
        }, true, false)
      }
    })
  }

  manageSubscription () {
    let parameter = {
      params: {
        subscribe: true
      }
    }
    let url = 'configurations/list'
    http('get', url, parameter, (response) => {
      response.data.forEach(configuration => {
        this.subscribe(configuration.notifyObject.id)
      })
    }, false, false)
  }

  disconnect () {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe()
      })
    }
    if (typeof this.client.disconnect === 'function') {
      this.client.disconnect(() => {
      })
    }
  }
  subscribe (topic) {
    let subTopic = alarmTopic + topic
    let queueId = store.getters.getCurrentUser.username + topic
    let subscription = this.client.subscribe(subTopic, (msg) => {
      // msg.ack()
      let alarm = JSON.parse(msg.body)
      store.commit('report', alarm)
      if (!store.getters.isSilent(alarm.notifyObject.id)) {
        let alert = new Audio('./statics/alert.wav')
        alert.type = 'audio/wav'
        alert.play()
      }
    }, { durable: true, 'auto-delete': false, 'x-queue-name': queueId })
    this.subscriptions.set(subTopic, subscription)
  }
  unsubscribe (topic) {
    let subscription = this.subscriptions.get(alarmTopic + topic)
    subscription.unsubscribe()
  }
  operate (deviceId, operateType, name, input, successCallback, failCallback) {
    let topic = '/topic/operation.' + operateType + '.' + deviceId
    let date = new Date()
    let requestId = date.valueOf()
    let request
    request = {
      requestId: requestId
    }
    if (operateType === 'action') {
      request.action = name
      request.value = input
    } else if (operateType === 'set') {
      request.attribute = name
      request.value = input[name]
    } else if (operateType === 'get') {
      request.attribute = name
    }
    Loading.show()
    let resultTopic = '/topic/result.' + operateType + '.' + deviceId + '.' + requestId
    let returned = false
    let subscription = this.client.subscribe(resultTopic, (msg) => {
      Loading.hide()
      subscription.unsubscribe()
      returned = true
      let result = JSON.parse(msg.body)
      if (result.success) {
        if (typeof successCallback === 'function') {
          successCallback(result)
        }
      } else {
        var error = result.error
        Notify.create({
          message: error
        })
        if (typeof failCallback === 'function') {
          failCallback()
        }
      }
    })
    this.client.send(topic, {}, JSON.stringify(request))
    setTimeout(() => {
      if (!returned) {
        Loading.hide()
        subscription.unsubscribe()
        Notify.create({
          message: '系统无响应！'
        })
      }
    }, 10000)
  }
}

export let stomp = new StompClient()
