<template>
    <q-stepper
      ref="stepper"
      v-model="step"
      vertical
      animated
      color="primary"
      done="true"
      v-if="getDefinition() && Object.keys(getDefinition()).length > 0"
    >
      <q-step
        icon="edit"
        :name="index"
        :title="getTitle(key, value)"
        :caption="value.error?value.errorMsg:''"
        :done="step > 0"
        v-for="(value, key, index) in getDefinition()"
        :key="key"
        :error="value.error"
      >
        <q-field v-if="value.dataType.type === 'Int'"
                 :hint="getHint(value)"
        >
          <q-input class="self-center full-width no-outline" v-model="value.input" @change="check(key, value)" autofocus/>
        </q-field>
        <q-field v-else-if="value.dataType.type === 'Decimal' "
                 :hint="getHint(value)"
        >
          <q-input class="self-center full-width no-outline" v-model="value.input" @change="check(key, value)" autofocus/>
        </q-field>
        <q-field v-else-if="value.dataType.type === 'String'"
                 :hint="getHint(value)"
        >
          <q-input class="self-center full-width no-outline" v-model="value.input" @change="check(key, value)" autofocus/>
        </q-field>
        <q-field v-else-if="value.dataType.type === 'DateTime'"
                 :hint="getHint(value)"
        >
          <q-input class="self-center full-width no-outline"  v-model="value.input" @change="check(key, value)" autofocus>
          </q-input>
        </q-field>
        <q-field v-else-if="value.dataType.type === 'Bool'"
                 :hint="getHint(value)"
        >
          <q-checkbox toggle-indeterminate v-model="value.input" @input="check(key, value)"/>
        </q-field>
        <q-field v-else-if="value.dataType.type === 'Enum'"
                 :hint="getHint(value)"
        >
          <q-select class="self-center full-width no-outline" v-model="value.input" :options="getOptions(value.dataType.enumType)" @change="check(key, value)" />
        </q-field>
        <q-field v-else-if="value.dataType.type === 'Location' "
                 :hint="getHint(value)"
        >
          <q-input class="self-center full-width no-outline" prefix="经度： " v-model="value.longitude" @change="check(key, value)" autofocus/>
          <q-input class="self-center full-width no-outline" prefix="纬度： " v-model="value.lantitude" @change="check(key, value)" />
        </q-field>
        <AttributeInput :attDefinition="getStructInfo(value.dataType.attTypes)" v-else-if="value.dataType.type === 'Struct'" type="Struct" :ref="key" :indexName="getIndexName(key)"/>
        <AttributeInput :attDefinition="getArrayInfo(value.dataType, value.optional)" v-else-if="value.dataType.type === 'Array'"  type="Array" :ref="key" :indexName="getIndexName(key)"/>
        <AttributeInput :attDefinition="getChoiceInfo(value.dataType.attTypes, choice)" v-else  type="Choice" :ref="key" :indexName="getIndexName(key)"/>
        <q-stepper-navigation content>
          <q-select label="选择" v-if="value.dataType.type === 'Choice'" :options="getChoice(value.dataType.attTypes)" @input="($value) => { setChoiceValue($value, value) }" :value="getChoiceValue(choice, value.dataType.attTypes)"></q-select>
          <div class="q-gutter-xs q-my-xs">
            <q-btn color="primary" label="继续" @click="clickCheck(key, value, true)" v-if="showDownward(index)" ></q-btn>
            <q-btn color="primary" label="回退" @click="clickCheck(key, value, false)" v-if="showUpward(index)" ></q-btn>
            <q-btn color="primary" label="添加" @click="addArray(key)" v-if="type === 'Array'" ></q-btn>
            <q-btn color="primary" label="删除" @click="deleteArray(key)" v-if="showDelete(type, key)" ></q-btn>
          </div>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
</template>
<script>

export default {
  name: 'AttributeInput',
  props: ['attDefinition', 'title', 'subTitle', 'type', 'indexName'],
  data () {
    return {
      step: 0,
      choice: ''
    }
  },
  created: function () {
    if (this.type === 'Array') {
      if (!this.$store.getters.exist(this.indexName)) {
        this.$store.commit('storeArray', { name: this.indexName, definition: this.attDefinition })
      }
    }
  },
  methods: {
    getDefinition () {
      if (this.type === 'Array') {
        return this.$store.getters.arrayDefinition(this.indexName)
      } else {
        return this.attDefinition
      }
    },
    getIndexName (key) {
      if (this.indexName === undefined) {
        return key
      } else {
        return this.indexName + key
      }
    },
    getHint (value) {
      let hint = ''
      if (value.dataType.type === 'DateTime') {
        hint = '格式: ' + value.dataType.format
      } else if (value.dataType.type === 'String') {
        hint = '最小长度:' + value.dataType.min + '最大长度: ' + value.dataType.max
      }
      return hint
    },
    check (key, value) {
      let type = value.dataType.type
      if (type === 'Int') {
        this.checkInt(key, value)
      } else if (type === 'Decimal') {
        this.checkDecimal(key, value)
      } else if (type === 'String') {
        this.checkString(key, value)
      } else if (type === 'Location') {
        this.checkLocation(key, value)
      } else {
        value.error = false
      }
      this.$forceUpdate()
    },
    checkInt (key, value) {
      if (!/^\d+$/.test(value.input)) {
        value.error = true
        value.errorMsg = key + '为整数'
      } else {
        value.error = false
        value.errorMsg = ''
      }
    },
    isNotDecimal: function (value) {
      return !(!isNaN(value) && value.toString().indexOf('.') !== -1)
    },
    checkDecimal (key, value) {
      if (this.isNotDecimal(value.input)) {
        value.error = true
        value.errorMsg = key + '为小数'
      } else {
        value.error = false
        value.errorMsg = ''
      }
    },
    checkString (key, value) {
      let len = value.input.length
      let min = parseInt(value.dataType.min)
      let max = parseInt(value.dataType.max)
      if (len < min || len > max) {
        value.error = true
        value.errorMsg = key + '的长度不在规定范围内'
      } else {
        value.error = false
        value.errorMsg = ''
      }
    },
    checkLocation (key, value) {
      value.error = false
      value.errorMsg = ''
      if (this.isNotDecimal((value.longitude)) || parseFloat(value.longitude) > 180 || parseFloat(value.longitude) < -180) {
        value.error = true
        value.errorMsg = key + '经度为小数,且在-180至180之间'
      }
      if (this.isNotDecimal((value.lantitude)) || parseFloat(value.lantitude) > 90 || parseFloat(value.lantitude) < -90) {
        value.error = true
        if (value.errorMsg.length > 0) {
          value.errorMsg += ';' + key + '纬度为小数,且在-90至90之间'
        } else {
          value.errorMsg = key + '纬度为小数,且在-90至90之间'
        }
      }
      if (value.errorMsg.length === 0) {
        value.input = value.longitude + ',' + value.lantitude
      }
    },
    canSubmit () {
      var valid = true
      for (var key in this.getDefinition()) {
        var value = this.getDefinition()[key]
        this.isValid(key, value)
        if (value.error) {
          valid = false
          break
        }
      }
      if (valid) {
        return true
      } else {
        return false
      }
    },
    getInputValue () {
      let result = {}
      for (var key in this.getDefinition()) {
        var value = this.getDefinition()[key]
        this.isValid(key, value)
        result[key] = value.input
      }
      return this.convert(result)
    },
    convert (inputValue) {
      var requestInfo = {}
      for (var key in this.attDefinition) {
        var definition = this.attDefinition[key]
        var type = definition.dataType.type
        var value = inputValue[key]
        var result
        if (type === 'Array') {
          result = this.convertArray(definition.dataType.dataType, value)
        } else if (type === 'Struct') {
          result = this.convertStruct(definition.dataType.attTypes, value)
        } else if (type === 'Choice') {
          result = this.convertChoice(definition.dataType.attTypes, value)
        } else {
          result = this.convertStr(definition.dataType, value)
        }
        requestInfo[key] = result
      }
      return requestInfo
    },
    convertChoice (definition, value) {
      var choiceKey = Object.keys(value)[0]
      var choiceValue = definition[choiceKey]
      var choiceDef = {}
      choiceDef[choiceKey] = choiceValue
      return this.convertStruct(choiceDef, value)
    },
    convertStruct (definition, value) {
      var structInfo = {}
      for (var key in definition) {
        var v = value[key]
        var d = definition[key].dataType
        var result
        var type = definition[key].dataType.type

        if (type === 'Struct') {
          result = this.convertStruct(d.attTypes, v)
        } else if (type === 'Array') {
          result = this.convertArray(d.dataType, v)
        } else if (type === 'Choice') {
          result = this.convertChoice(d.attTypes, v)
        } else {
          result = this.convertStr(d, v)
        }
        structInfo[key] = result
      }
      return { structValue: structInfo }
    },
    convertArray (definition, value) {
      var arrayInfo = []
      var arrayDataType = definition.type
      for (var key in value) {
        var v = value[key]
        var d
        var result

        if (arrayDataType === 'Array') {
          d = definition.dataType
          result = this.convertArray(d, v)
        } else if (arrayDataType === 'Struct') {
          d = definition.attTypes
          result = this.convertStruct(d, v)
        } else if (arrayDataType === 'Choice') {
          d = definition.attTypes
          result = this.convertChoice(d, v)
        } else {
          result = this.convertStr(definition, v)
        }
        arrayInfo.push(result)
      }
      return { arrayValue: arrayInfo }
    },
    convertStr (definition, value) {
      return { value: value }
    },
    isBlank: function (value) {
      return value === undefined || value === null || value.length === 0
    },
    isValid (key, value) {
      var type = value.dataType.type
      if (type !== 'Struct' && type !== 'Array' && type !== 'Choice') {
        if ((type !== 'Location' && this.isBlank(value.input)) || (type === 'Location' && (this.isBlank(value.longitude) || this.isBlank(value.lantitude)))) {
          if (value.optional === false) {
            value.error = true
            value.errorMsg = key + '不可空'
          } else {
            value.error = false
            value.errorMsg = ''
          }
        } else {
          if (type === 'Int') {
            this.checkInt(key, value)
          } else if (type === 'Decimal') {
            this.checkDecimal(key, value)
          } else if (type === 'String') {
            this.checkString(key, value)
          } else if (type === 'Location') {
            this.checkLocation(key, value)
          } else {
            value.error = false
            value.errorMsg = ''
          }
        }
      } else {
        let valid = true
        let node = {}
        if (this.$refs[key] !== undefined && this.$refs[key][0] !== undefined) {
          node = this.$refs[key][0]
          for (var k in node.getDefinition()) {
            var v = node.getDefinition()[k]
            node.isValid(k, v)
            if (v.error) {
              valid = false
              value.error = true
              value.errorMsg = v.errorMsg
            } else {
              if (value.input === undefined || value.input === null) {
                value.input = {}
              }
              if (v.input !== undefined) {
                if (value.dataType.type === 'Array') {
                  var arrayk = parseInt(k) - 1
                  value.input[arrayk] = v.input
                } else {
                  value.input[k] = v.input
                }
              }
            }
          }
          if (type === 'Array') {
            var plus = parseInt(k)
            if (!value.error && value.input[plus] !== undefined) {
              delete value.input[plus]
            }
          }
        } else {
          var passinfo = this.$store.getters.passInfo(this.getIndexName(key))

          if (passinfo === undefined && !value.optional) {
            valid = false
            value.error = true
            if (this.type === 'Array') {
              value.errorMsg = '请输入数组第' + key + '项内容'
            } else {
              value.errorMsg = '请输入' + key
            }
          } else if (passinfo) {
            value.input = passinfo
          } else {
            value.input = null
          }
        }

        if (valid) {
          value.error = false
          value.errorMsg = ''
          this.$store.commit('pass', { name: this.getIndexName(key), input: value.input })
        }
      }

      this.$forceUpdate()
    },
    clickCheck (key, value, next) {
      this.isValid(key, value)

      if (!value.error) {
        if (next) {
          this.$refs.stepper.next()
        } else {
          this.$refs.stepper.previous()
        }
      }
    },
    showDelete (type, key) {
      if (type === 'Array') {
        if (key === '1') {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    },
    showDownward (index) {
      return index !== (Object.keys(this.getDefinition()).length - 1)
    },
    showUpward (index) {
      return index !== 0
    },
    addArray (key) {
      this.$store.commit('addArray', { name: this.indexName, key: key })
      this.$forceUpdate()
    },
    deleteArray (key) {
      this.$store.commit('deleteArray', { name: this.indexName, key: key })
      this.$forceUpdate()
      this.$refs.stepper.goTo(0)
    },
    getArrayInfo (dataType, optional) {
      dataType.optional = optional
      let arrayDefinition = { '1': dataType }
      return arrayDefinition
    },
    getStructInfo (attTypes) {
      let info = attTypes
      return info
    },
    getOrder (key, index, type) {
      return index + 1
    },
    getTitle (key, value) {
      let description
      if (value.description !== undefined && value.description !== null) {
        description = value.description
      } else {
        description = ''
      }
      let title
      if (value.optional === false) {
        title = key.toString() + '(' + value.dataType.type + '*) ' + description
      } else {
        title = key.toString() + '(' + value.dataType.type + ') ' + description
      }
      return title
    },
    getOptions (enums) {
      if (!enums) {
        return
      }
      let options = []
      let option
      for (let i = 0; i < enums.length; i++) {
        option = enums[i]
        options.push(option)
      }
      return options
    },
    getChoice (attTypes) {
      return Object.keys(attTypes)
    },
    getChoiceInfo (attTypes, key) {
      let info = {}
      info[key] = attTypes[key]
      return info
    },
    getChoiceValue (choice, value) {
      let c = choice === '' ? Object.keys(value)[0] : choice
      this.choice = c
      return c
    },
    setChoiceValue (value, v) {
      v.input = {}
      this.choice = value
    }
  }
}
</script>
