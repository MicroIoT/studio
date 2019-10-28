import Vue from 'vue'
export function isValidAttribute (attribute, name, subName) {
  if (typeof name === 'undefined') {
    name = '属性'
  }
  if (typeof subName === 'undefined') {
    subName = '属性'
  }
  if (attribute) {
    if (typeof attribute.name === 'undefined' || attribute.name.length === 0) {
      Vue.set(attribute, 'error', true)
      Vue.set(attribute, 'errorMsg', name + '名称不可空')
    } else if (typeof attribute.optional === 'undefined' || attribute.optional.length === 0) {
      Vue.set(attribute, 'error', true)
      Vue.set(attribute, 'errorMsg', name + '是否可空未设置')
    } else if (typeof attribute.dataType === 'undefined' || attribute.dataType.length === 0) {
      Vue.set(attribute, 'error', true)
      Vue.set(attribute, 'errorMsg', name + '数据类型不可空')
    } else if (attribute.dataType === 'Array' && typeof attribute.arraytype === 'undefined') {
      Vue.set(attribute, 'error', true)
      Vue.set(attribute, 'errorMsg', 'Array数据类型不可空')
    } else if (attribute.dataType === 'Array' && attribute.arraytype === 'Array') {
      Vue.set(attribute, 'error', true)
      Vue.set(attribute, 'errorMsg', 'Array数据类型不可以是Array')
    } else if ((attribute.dataType === 'Enum' || (attribute.dataType === 'Array' && attribute.arraytype === 'Enum')) && typeof attribute.enum === 'undefined') {
      Vue.set(attribute, 'error', true)
      Vue.set(attribute, 'errorMsg', 'Enum值未定义')
    } else if ((attribute.dataType === 'DateTime' || (attribute.dataType === 'Array' && attribute.arraytype === 'DateTime')) && typeof attribute.datetime === 'undefined') {
      Vue.set(attribute, 'error', true)
      Vue.set(attribute, 'errorMsg', 'DateTime格式未定义')
    } else if (attribute.dataType === 'String' || (attribute.dataType === 'Array' && attribute.arraytype === 'String')) {
      if (typeof attribute.stringmin !== 'undefined' && !/^\d+$/.test(attribute.stringmin)) {
        Vue.set(attribute, 'error', true)
        Vue.set(attribute, 'errorMsg', 'String最小长度必须是正整数')
      } else if (typeof attribute.stringmax !== 'undefined' && !/^\d+$/.test(attribute.stringmax)) {
        Vue.set(attribute, 'error', true)
        Vue.set(attribute, 'errorMsg', 'String最大长度必须是正整数')
      } else if (parseInt(attribute.stringmin) > parseInt(attribute.stringmax)) {
        Vue.set(attribute, 'error', true)
        Vue.set(attribute, 'errorMsg', 'String最小长度不能大于最大长度')
      } else {
        Vue.set(attribute, 'error', false)
      }
    } else if (attribute.dataType === 'Struct' || (attribute.dataType === 'Array' && attribute.arraytype === 'Struct')) {
      if (typeof attribute.attributes === 'undefined' || attribute.attributes.length === 0) {
        Vue.set(attribute, 'error', true)
        Vue.set(attribute, 'errorMsg', 'Struct未定义')
      } else {
        for (var i = 0; i < attribute.attributes.length; i++) {
          isValidAttribute(attribute.attributes[i], subName, subName)
          if (attribute.attributes[i].error) {
            Vue.set(attribute, 'error', true)
            Vue.set(attribute, 'errorMsg', attribute.name + subName + (i + 1).toString() + ':' + attribute.attributes[i].errorMsg)
            return
          }
        }
        Vue.set(attribute, 'error', false)
      }
    } else if (attribute.dataType === 'Choice' || (attribute.dataType === 'Array' && attribute.arraytype === 'Choice')) {
      if (typeof attribute.choices === 'undefined' || Object.keys(attribute.choices).length === 0) {
        Vue.set(attribute, 'error', true)
        Vue.set(attribute, 'errorMsg', 'Choice未定义')
      } else {
        for (var key in attribute.choices) {
          for (var j = 0; j < attribute.choices[key].attributes.length; j++) {
            isValidAttribute(attribute.choices[key].attributes[j], subName, subName)
            if (attribute.choices[key].attributes[j].error) {
              Vue.set(attribute, 'error', true)
              Vue.set(attribute, 'errorMsg', attribute.name + 'Choice: ' + key + subName + (j + 1).toString() + ':' + attribute.choices[key].attributes[j].errorMsg)
              return
            }
          }
        }
        Vue.set(attribute, 'error', false)
      }
    } else {
      Vue.set(attribute, 'error', false)
    }
  } else {
    Vue.set(attribute, 'error', true)
    Vue.set(attribute, 'errorMsg', name + '未定义')
  }
}

export function isValidAttributes (attributes, name, subName) {
  if (typeof name === 'undefined') {
    name = '属性'
  }
  if (typeof attributes !== 'undefined') {
    for (var i = 0; i < attributes.length; i++) {
      isValidAttribute(attributes[i], name, subName)
      if (attributes[i].error) {
        Vue.set(attributes, 'error', true)
        Vue.set(attributes, 'errorMsg', name + (i + 1).toString() + attributes[i].errorMsg)
        return false
      }
    }
    Vue.set(attributes, 'error', false)
    Vue.set(attributes, 'errorMsg', '')
  }

  return true
}

export function getAttributes (atts, device) {
  let attributes = []
  if (typeof atts !== 'undefined') {
    for (var i = 0; i < atts.length; i++) {
      let attribute = getAttribute(atts[i], device)
      attributes.push(attribute)
    }
  }
  return attributes
}

export function getAttribute (attribute, device) {
  let type = attribute.dataType
  let info = {
    name: attribute.name,
    description: attribute.description,
    optional: attribute.optional,
    dataType: type,
    dataTypeInfos: {},
    additional: []
  }
  if (device) {
    info.dataTypeInfos['attribute.get'] = attribute.get
    info.dataTypeInfos['attribute.set'] = attribute.set
    info.dataTypeInfos['attribute.report'] = attribute.report
  }
  if (type === 'Array') {
    info.dataTypeInfos['array.type'] = attribute.arraytype
  }
  if (type === 'Enum' || (type === 'Array' && attribute.arraytype === 'Enum')) {
    info.dataTypeInfos['enum.value'] = attribute.enum
  } else if (type === 'String' || (type === 'Array' && attribute.arraytype === 'String')) {
    if (typeof attribute.stringmin !== 'undefined' && typeof attribute.stringmax !== 'undefined') {
      info.dataTypeInfos['string.min'] = attribute.stringmin
      info.dataTypeInfos['string.max'] = attribute.stringmax
    } else if (typeof attribute.stringmin !== 'undefined' && typeof attribute.stringmax === 'undefined') {
      info.dataTypeInfos['string.min'] = attribute.stringmin
    } else if (typeof attribute.stringmin === 'undefined' && typeof attribute.stringmax !== 'undefined') {
      info.dataTypeInfos['string.max'] = attribute.stringmax
    }
  } else if (type === 'DateTime' || (type === 'Array' && attribute.arraytype === 'DateTime')) {
    info.dataTypeInfos['date.format'] = attribute.datetime
  } else if (type === 'Struct' || (type === 'Array' && attribute.arraytype === 'Struct')) {
    for (var i = 0; i < attribute.attributes.length; i++) {
      let struct = getAttribute(attribute.attributes[i])
      info.additional.push(struct)
    }
  } else if (type === 'Choice' || (type === 'Array' && attribute.arraytype === 'Choice')) {
    for (var key in attribute.choices) {
      let choice = {
        name: attribute.choices[key].name,
        description: attribute.choices[key].description,
        optional: false,
        dataType: 'Struct',
        additional: []
      }
      for (var j = 0; j < attribute.choices[key].attributes.length; j++) {
        let struct = getAttribute(attribute.choices[key].attributes[j])
        choice.additional.push(struct)
      }
      info.additional.push(choice)
    }
  }
  return info
}
