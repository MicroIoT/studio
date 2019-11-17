import * as keys from './keys'
import { http } from '../components/http'
import { date } from 'quasar'
import store from './index'

const state = {
  alarmDetails: [],
  alarmTop: [],
  alarmSilent: []
}

const getters = {
  getAlarms: state => {
    let groups = {}
    for (var i = 0; i < state.alarmDetails.length; i++) {
      if (state.alarmDetails[i].domain.id === store.getters.getDomain.id) {
        let notifyObjectId = state.alarmDetails[i].notifyObject.id
        if (groups[notifyObjectId] == null) {
          groups[notifyObjectId] = []
        }
        groups[notifyObjectId].push(state.alarmDetails[i])
      }
    }
    let alarms = []
    for (var notifyObjectId in groups) {
      let amount = Object.keys(groups[notifyObjectId]).reduce((accumulator, key) => {
        if (groups[notifyObjectId][key].read) {
          return accumulator
        } else {
          return accumulator + 1
        }
      }, 0)
      let silent = state.alarmSilent.includes(notifyObjectId)
      let top = state.alarmTop.includes(notifyObjectId)
      let alarm = {
        notifyObjectId: notifyObjectId,
        notifyObjectType: groups[notifyObjectId][0].notifyObject.type,
        notifyObjectName: groups[notifyObjectId][0].notifyObject.string,
        time: groups[notifyObjectId][0].receiveTime,
        alarmType: groups[notifyObjectId][0].alarmType,
        amount: amount,
        silent: silent,
        top: top
      }
      if (state.alarmTop.includes(alarm.notifyObjectId)) {
        alarms.unshift(alarm)
      } else {
        alarms.push(alarm)
      }
    }
    return alarms
  },
  getAlarmTotal: state => {
    if (state.alarmDetails && state.alarmDetails.length > 0) {
      return Object.keys(state.alarmDetails).reduce((accumulator, key) => {
        if (state.alarmDetails[key].domain.id === store.getters.getDomain.id) {
          if (state.alarmDetails[key].read) {
            return accumulator
          } else {
            return accumulator + 1
          }
        } else {
          return accumulator
        }
      }, 0)
    } else {
      return 0
    }
  },
  isSilent: state => {
    return (notifyObjectId) => {
      return state.alarmSilent.includes(notifyObjectId)
    }
  },
  isTop: state => {
    return (notifyObjectId) => {
      return state.alarmTop.includes(notifyObjectId)
    }
  },
  getNotifyObjectAlarmTotal: state => {
    return (notifyObjectId) => {
      if (state.alarmDetails && state.alarmDetails.length > 0) {
        return Object.keys(state.alarmDetails).reduce((accumulator, key) => {
          if (!state.alarmDetails[key].read && state.alarmDetails[key].notifyObject.id === notifyObjectId) {
            return accumulator + 1
          } else {
            return accumulator
          }
        }, 0)
      } else {
        return 0
      }
    }
  },
  getAlarmDetails: state => {
    return (notifyObjectId, key, value) => {
      return state.alarmDetails.filter(alarm => {
        if (key === 'type' && value.length > 0) {
          return alarm.notifyObject.id === notifyObjectId && alarm.alarmType.includes(value)
        } else if (key === 'information' && value.length > 0) {
          if (typeof alarm.alarmInfo !== 'undefined') {
            let valuestr = JSON.stringify(alarm.alarmInfo)
            return alarm.notifyObject.id === notifyObjectId && valuestr.includes(value)
          }
        } else if (key === 'date' && value) {
          let dateValue = date.formatDate(value, 'YYYY-MM-DD')
          let searchDate = dateValue.substr(0, 10)
          return alarm.notifyObject.id === notifyObjectId && (alarm.reportTime.includes(searchDate))
        } else {
          return alarm.notifyObject.id === notifyObjectId
        }
      })
    }
  }
}

const mutations = {
  init (state) {
    if (window.sessionStorage.getItem(keys.USER_STATE) === null) {
      state.alarmDetails = []
    } else {
      let user = window.sessionStorage.getItem(keys.USER_STATE)
      let username = JSON.parse(user).username
      let detailKey = username + '.' + keys.ALARM_DETAILS_STATE
      let alarmDetails = window.localStorage.getItem(detailKey)
      if (alarmDetails === null) {
        state.alarmDetails = []
      } else {
        state.alarmDetails = JSON.parse(alarmDetails)
      }
    }

    let parameter = {
      params: {
        top: true
      }
    }
    let url = 'configurations/list'
    http('get', url, parameter, (response) => {
      state.alarmTop = []
      response.data.forEach(configuration => {
        state.alarmTop.push(configuration.notifyObject.id)
      })
    })
    parameter = {
      params: {
        silent: true
      }
    }
    http('get', url, parameter, (response) => {
      state.alarmSilent = []
      response.data.forEach(configuration => {
        state.alarmSilent.push(configuration.notifyObject.id)
      })
    })
  },
  addTop (state, notifyObjectId) {
    state.alarmTop.push(notifyObjectId)
  },
  removeTop (state, notifyObjectId) {
    let index = state.alarmTop.indexOf(notifyObjectId)
    if (index > -1) {
      state.alarmTop.splice(index, 1)
    }
  },
  addSilent (state, notifyObjectId) {
    state.alarmSilent.push(notifyObjectId)
  },
  removeSilent (state, notifyObjectId) {
    let index = state.alarmSilent.indexOf(notifyObjectId)
    if (index > -1) {
      state.alarmSilent.splice(index, 1)
    }
  },
  delete (state, alarmId) {
    var index = state.alarmDetails.findIndex((alarm) => {
      return alarm.id === alarmId
    })
    state.alarmDetails.splice(index, 1)
  },
  clear (state, notifyObjectId) {
    var index = state.alarmDetails.findIndex((alarm) => {
      return alarm.notifyObject.id === notifyObjectId
    })
    while (index !== -1) {
      state.alarmDetails.splice(index, 1)
      index = state.alarmDetails.findIndex((alarm) => {
        return alarm.notifyObject.id === notifyObjectId
      })
    }
  },
  read (state, alarmId) {
    var index = state.alarmDetails.findIndex((alarm) => {
      return alarm.id === alarmId
    })
    state.alarmDetails[index].read = true
  },
  unread (state, alarmId) {
    var index = state.alarmDetails.findIndex((alarm) => {
      return alarm.id === alarmId
    })
    state.alarmDetails[index].read = false
  },
  report (state, alarm) {
    alarm.read = false
    state.alarmDetails.unshift(alarm)
  }
}

export default {
  state,
  getters,
  mutations
}
