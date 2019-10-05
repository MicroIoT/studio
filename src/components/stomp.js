import Stomp from 'stompjs'
import ReconnectingWebSocket from 'ReconnectingWebSocket'
import store from '../store'
import { http } from './http'
import { Loading, Notify } from 'quasar'

const alarmTopic = '/topic/alarm.'
class StompClient {
  constructor () {
    this.ws = {}
    this.client = {}
    this.subscriptions = new Map()
  }
  connect () {
    let wsUrl = store.getters.getWs + store.getters.getServer + '/ws_iot'

    this.ws = new ReconnectingWebSocket(wsUrl, null, { debug: false, maxReconnectAttempts: null, reconnectInterval: 10000 })
    this.client = Stomp.over(this.ws)
    let token = store.getters.getToken.token
    let header = {
      'Authorization': `Bearer ${token}`
    }
    this.client.connect(header, () => {
      this.subArea()
    }, (error) => {
      console.log('stomp error ')
      console.log(error)

      http('get', '/token', null, (response) => {
        store.commit('token', response.data)
        let token = store.getters.getToken.token
        let header = {
          'Authorization': `Bearer ${token}`
        }
        this.client.connect(header, () => {
          this.subArea()
        })
      }, true)
    })
  }

  subArea () {
    if (store.getters.getCurrentUser.isArea) {
      http('get', '/sites/me', '', (response) => {
        let sites = response.data
        let site
        for (var i = 0; i < sites.length; i++) {
          site = sites[i]
          stomp.subscribe(site.id)
        }
        http('get', '/devices/area', '', (response) => {
          let devices = response.data
          let device
          for (var i = 0; i < devices.length; i++) {
            device = devices[i]
            stomp.subscribe(device.id)
          }
        })
      })
    }
  }

  disconnect () {
    if (store.getters.getCurrentUser.isArea) {
      http('get', '/devices/area', '', (response) => {
        let devices = response.data
        let device
        for (var i = 0; i < devices.length; i++) {
          device = devices[i]
          stomp.unsubscribe(device.id)
        }
      })
    }
    this.client.disconnect(() => {
      console.log('websocket disconnected')
    })
    // this.ws.close()
  }
  subscribe (topic) {
    let subTopic = alarmTopic + topic
    let queueId = store.getters.getCurrentUser.username + topic
    let subscription = this.client.subscribe(subTopic, (msg) => {
      // msg.ack()
      let alarm = JSON.parse(msg.body)
      store.commit('report', alarm)
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
    let receipt = 'receipt_' + requestId
    let subscription = this.client.subscribe(resultTopic, (msg) => {
      Loading.hide()
      subscription.unsubscribe()
      returned = true
      let result = JSON.parse(msg.body)
      if (result.success) {
        successCallback(result)
      } else {
        var error = result.error
        Notify.create({
          message: error
        })
        failCallback()
      }
    }, { receipt: receipt })
    this.client.onreceipt = (frame) => {
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
}

export let stomp = new StompClient()
