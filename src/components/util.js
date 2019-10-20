import store from '../store'
import { stomp } from './stomp'

export function getTypeInfo (dataType) {
  let info = ''
  if (dataType.type === 'Enum') {
    info = dataType.enumType
  } else if (dataType.type === 'String') {
    let min = dataType.min
    let max = dataType.max
    let mininfo, maxinfo
    if (min !== null) {
      mininfo = '最小长度:' + min
    }
    if (max !== null) {
      maxinfo = ' 最大长度:' + max
    }
    info = mininfo + maxinfo
  } else if (dataType.type === 'DateTime') {
    info = '日期格式：' + dataType.format
  } else if (dataType.type === 'Array') {
    info = dataType.dataType.type + '\n' + getTypeInfo(dataType.dataType)
  }
  return info
}
export function formatDate (date, simple) {
  var now = new Date()
  var day = now.getDate()
  var month = now.getMonth() + 1
  var year = now.getFullYear()
  var alarmMonth = parseInt(date.substr(5, 2))
  var alarmDay = parseInt(date.substr(8, 2))
  var alarmYear = parseInt(date.substr(0, 4))
  var alarmHMS = date.substr(11, 8)

  var alarmTime = alarmYear + '' + alarmMonth + '' + alarmDay
  var time = year + '' + month + '' + day
  if (time === alarmTime) {
    return alarmHMS
  } else {
    if (simple) {
      return alarmMonth + '月' + alarmDay + '日'
    } else {
      return alarmMonth + '月' + alarmDay + '日' + ' ' + alarmHMS
    }
  }
}
export function initSystem () {
  stomp.connect()
  store.commit('init')
}
export function refreshSystem () {
  stomp.disconnect()
  initSystem()
}
