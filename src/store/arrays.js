const state = {
  arrayInfos: {},
  passInfo: {}
}

const getters = {
  passInfo: state => {
    return (indexName) => {
      return state.passInfo[indexName]
    }
  },
  arrayDefinition: state => {
    return (indexName) => {
      return state.arrayInfos[indexName]
    }
  },
  exist: state => {
    return (indexName) => {
      if (state.arrayInfos[indexName] !== undefined) {
        return true
      } else {
        return false
      }
    }
  }
}

const mutations = {
  pass (state, info) {
    state.passInfo[info.name] = info.input
  },
  storeArray (state, info) {
    state.arrayInfos[info.name] = info.definition
  },
  addArray (state, info) {
    let total = Object.keys(state.arrayInfos[info.name]).length + 1
    let value = state.arrayInfos[info.name][info.key]

    state.arrayInfos[info.name][total.toString()] = JSON.parse(JSON.stringify(value))
  },
  deleteArray (state, info) {
    let total = Object.keys(state.arrayInfos[info.name]).length
    if (parseInt(info.key) === total) {
      delete state.arrayInfos[info.name][(info.key).toString()]
    } else {
      for (var i = info.key; i < total; i++) {
        var oldKey = parseInt(i) + 1
        var newKey = i
        if (oldKey !== newKey) {
          Object.defineProperty(state.arrayInfos[info.name], newKey.toString(), Object.getOwnPropertyDescriptor(state.arrayInfos[info.name], oldKey.toString()))
          delete state.arrayInfos[info.name][oldKey.toString()]
        }
      }
    }
  },
  close (state) {
    state.arrayInfos = {}
    state.passInfo = {}
  }
}

export default {
  state,
  getters,
  mutations
}
