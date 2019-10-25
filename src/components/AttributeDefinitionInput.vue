<template>
  <q-stepper
    ref="stepper"
    v-model="attStep"
    vertical
    color="primary"
    animated
    v-if="typeof attributes !== 'undefined' && attributes.length > 0"
  >
    <q-step
      v-for="(attribute, key) in attributes"
      :name="key"
      :title="getTitle(attribute, key)"
      :caption="attribute.error?attribute.errorMsg:''"
      icon="edit"
      :key="key"
      :done="attStep > key"
      :error="attribute.error"
    >
      <q-stepper
        ref="infoStepper"
        v-model="attInfoStep"
        vertical
        animated
        color="primary"
      >
        <q-step
          :name="1"
          title="属性信息"
          :caption="attribute.error?attribute.errorMsg:''"
          :done="attInfoStep > 1"
          :error="attribute.error"
        >
          <q-field label="属性名称(*)" dense
                   hint="">
            <q-input class="self-center full-width no-outline" v-model="attribute.name" autofocus/>
          </q-field>
          <q-field label="属性描述" dense
                   hint="">
            <q-input class="self-center full-width no-outline" v-model="attribute.description"/>
          </q-field>
          <q-field label="属性是否可空(*)" dense
                   hint="">
            <q-checkbox class="self-bottom full-width no-outline" v-model="attribute.optional"/>
          </q-field>
          <q-field label="属性数据类型(*)" dense
                   hint="">
            <q-select class="self-center full-width no-outline" v-model="attribute.dataType" :options="dataTypes" @input="dataTypeChanged"/>
          </q-field>
          <div v-if="attribute.dataType === 'Array'">
            <q-field label="Array数据类型" dense
                     hint="">
              <q-select class="self-center full-width no-outline" v-model="attribute.arraytype" :options="dataTypes" />
            </q-field>
            <div v-if="attribute.arraytype === 'String'">
              <q-field label="String最小长度" dense
                       hint="">
                <q-input class="self-center full-width no-outline" v-model="attribute.stringmin"/>
              </q-field>
              <q-field label="String最大长度" dense
                       hint="">
                <q-input class="self-center full-width no-outline" v-model="attribute.stringmax"/>
              </q-field>
            </div>
            <div v-if="attribute.arraytype === 'DateTime'">
              <q-field label="DateTime格式(*)" dense
                       hint="">
                <q-input class="self-center full-width no-outline" v-model="attribute.datetime"/>
              </q-field>
            </div>
            <div v-if="attribute.arraytype === 'Enum'">
              <q-field label="Enum值，Enum值之间用;分割(*)" dense
                       hint="">
                <q-input class="self-center full-width no-outline" v-model="attribute.enum"/>
              </q-field>
            </div>
          </div>
          <div v-if="attribute.dataType === 'String'">
            <q-field label="String最小长度" dense
                     hint="">
              <q-input class="self-center full-width no-outline" v-model="attribute.stringmin"/>
            </q-field>
            <q-field label="String最大长度" dense
                     hint="">
              <q-input class="self-center full-width no-outline" v-model="attribute.stringmax"/>
            </q-field>
          </div>
          <div v-if="attribute.dataType === 'DateTime'">
            <q-field label="DateTime格式" dense
                     hint="">
              <q-input class="self-center full-width no-outline" v-model="attribute.datetime"/>
            </q-field>
          </div>
          <div v-if="attribute.dataType === 'Enum'">
            <q-field label="Enum值，Enum值之间用;分割" dense
                     hint="">
              <q-input class="self-center full-width no-outline" v-model="attribute.enum"/>
            </q-field>
          </div>
          <q-stepper-navigation>
            <q-btn color="primary"
                   v-if="attribute.dataType === 'Struct' || attribute.dataType === 'Choice' || (attribute.dataType === 'Array' && (attribute.arraytype === 'Struct' || attribute.arraytype === 'Choice') )"
                   label="继续"
                   @click="cont(attribute)"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step
          :name="2"
          title="属性附加信息"
          :done="attInfoStep > 2"
          v-if="attribute.dataType === 'Struct' || attribute.dataType === 'Choice' || (attribute.dataType === 'Array' && (attribute.arraytype === 'Struct' || attribute.arraytype === 'Choice') )"
        >
          <div v-if="attribute.dataType === 'Struct' || (attribute.dataType === 'Array' && (attribute.arraytype === 'Struct'))">
            <attribute-definition-input :attributes="getStruct(attribute)" :attributeName="attribute.name"></attribute-definition-input>
          </div>
          <div v-if="attribute.dataType === 'Choice' || (attribute.dataType === 'Array' && (attribute.arraytype === 'Choice'))">
            <q-stepper
              ref="choiceStepper"
              v-model="choiceInfoStep"
              vertical
              animated
              color="primary"
              v-if="attribute.choices && Object.keys(attribute.choices).length > 0"
            >
              <q-step
                v-for="(choice, key, index) in attribute.choices"
                :name="index"
                :title="key + (choice.description?': ' + choice.description: '')"
                :caption="attribute.error?attribute.errorMsg:''"
                :key="key"
                :error="attribute.error"
              >
                <attribute-definition-input :attributes="getStruct(choice)" :attributeName="key" :ref="key"></attribute-definition-input>
                <q-stepper-navigation>
                  <q-btn color="primary" label="继续"  v-if="showDownwardChoice(attribute.choices, index)" @click="clickCheckChoice(choice, true)"/>
                  <q-btn color="primary" label="回退" class="q-ml-sm" v-if="showUpwardChoice(index)" @click="clickCheckChoice(choice, false)"/>
                  <q-btn @click="addChoice(choice)" color="primary" label="添加"  class="q-ml-sm"/>
                  <q-btn @click="delChoice(attribute.choices, key)" color="primary" label="删除"  class="q-ml-sm"/>
                </q-stepper-navigation>
              </q-step>
            </q-stepper>
          </div>
          <q-stepper-navigation>
            <q-btn @click="add(attribute)" color="primary" label="添加"  class="q-ml-sm"/>
            <q-btn color="primary" label="回退"  @click="attInfoStep = 1" class="q-ml-sm"/>
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
      <q-stepper-navigation>
        <q-btn color="primary" label="继续"  v-if="showDownward(key)" @click="clickCheck(attribute, true)"/>
        <q-btn color="primary" label="回退" class="q-ml-sm" v-if="showUpward(key)" @click="clickCheck(attribute, false)"/>
        <q-btn color="primary" label="删除"  class="q-ml-sm" @click="delAttribute(key)" v-if="showDelete(key)"/>
      </q-stepper-navigation>
    </q-step>
    <q-dialog v-model="choiceDialog" persistent>
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Choice</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="choice.name" label="请输入Choice名称(*)" :error="$v.choice.name.$error" error-message="Choice名称不能为空" autofocus />
        </q-card-section>
        <q-card-section>
          <q-input v-model="choice.description" label="请输入Choice描述" />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn label="确定" color="primary" @click="inputChoice(choice.input)"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-stepper>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
export default {
  name: 'AttributeDefinitionInput',
  props: ['attributes', 'attributeName', 'subTitle', 'type', 'indexName'],
  data () {
    return {
      attStep: 0,
      attInfoStep: 1,
      structInfoStep: 0,
      choiceInfoStep: 0,
      dataTypes: ['Int', 'Decimal', 'String', 'DateTime', 'Bool', 'Enum', 'Location', 'Array', 'Struct', 'Choice'],
      structs: [],
      choices: {},
      choiceDialog: false,
      choice: {
        name: '',
        description: '',
        input: ''
      }
    }
  },
  created: function () {
  },
  validations: {
    choice: {
      name: { required }
    }
  },
  methods: {
    showDelete (key) {
      if (key !== 0) {
        return true
      } else {
        return false
      }
    },
    getTitle (attribute, key) {
      let suffix = ':'
      if (attribute.name && attribute.name.length > 0) {
        suffix = ':' + attribute.name
      }
      if (typeof this.attributeName === 'undefined') {
        return '属性' + ((key + 1).toString()) + suffix
      } else {
        return this.attributeName + '属性' + ((key + 1).toString()) + suffix
      }
    },
    cont (attribute) {
      this.isValidContinue(attribute)
      if (!attribute.error) {
        this.attInfoStep = 2
      }
      this.$forceUpdate()
    },
    isValidContinue (attribute) {
      if (typeof attribute.name === 'undefined' || attribute.name.length === 0) {
        attribute.error = true
        attribute.errorMsg = '属性名称不可空'
      } else if (typeof attribute.optional === 'undefined' || attribute.optional.length === 0) {
        attribute.error = true
        attribute.errorMsg = '属性是否可空未设置'
      } else {
        attribute.error = false
      }
    },
    canSubmit () {
      for (var i = 0; i < this.attributes.length; i++) {
        this.isValid(this.attributes[i])
        if (this.attributes[i].error) {
          return false
        }
      }
      return true
    },
    getAttributes () {
      let attributes = []
      for (var i = 0; i < this.attributes.length; i++) {
        let attribute = this.getAttTypeInfo(this.attributes[i])
        attributes.push(attribute)
      }
      return attributes
    },
    getAttTypeInfo (attribute) {
      let type = attribute.dataType
      let info = {
        name: attribute.name,
        description: attribute.description,
        optional: attribute.optional,
        dataType: type,
        dataTypeInfos: {},
        additional: []
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
          let struct = this.getAttTypeInfo(attribute.attributes[i])
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
            let struct = this.getAttTypeInfo(attribute.choices[key].attributes[j])
            choice.additional.push(struct)
          }
          info.additional.push(choice)
        }
      }
      return info
    },
    isValid (attribute) {
      if (attribute) {
        if (typeof attribute.name === 'undefined' || attribute.name.length === 0) {
          attribute.error = true
          attribute.errorMsg = '属性名称不可空'
        } else if (typeof attribute.optional === 'undefined' || attribute.optional.length === 0) {
          attribute.error = true
          attribute.errorMsg = '属性是否可空未设置'
        } else if (typeof attribute.dataType === 'undefined' || attribute.dataType.length === 0) {
          attribute.error = true
          attribute.errorMsg = '属性数据类型不可空'
        } else if (attribute.dataType === 'Array' && typeof attribute.arraytype === 'undefined') {
          attribute.error = true
          attribute.errorMsg = 'Array数据类型不可空'
        } else if (attribute.dataType === 'Array' && attribute.arraytype === 'Array') {
          attribute.error = true
          attribute.errorMsg = 'Array数据类型不可以是Array'
        } else if ((attribute.dataType === 'Enum' || (attribute.dataType === 'Array' && attribute.arraytype === 'Enum')) && typeof attribute.enum === 'undefined') {
          attribute.error = true
          attribute.errorMsg = 'Enum值未定义'
        } else if ((attribute.dataType === 'DateTime' || (attribute.dataType === 'Array' && attribute.arraytype === 'DateTime')) && typeof attribute.datetime === 'undefined') {
          attribute.error = true
          attribute.errorMsg = 'DateTime格式未定义'
        } else if (attribute.dataType === 'String' || (attribute.dataType === 'Array' && attribute.arraytype === 'String')) {
          if (typeof attribute.stringmin !== 'undefined' && !/^\d+$/.test(attribute.stringmin)) {
            attribute.error = true
            attribute.errorMsg = 'String最小长度必须是正整数'
          } else if (typeof attribute.stringmax !== 'undefined' && !/^\d+$/.test(attribute.stringmax)) {
            attribute.error = true
            attribute.errorMsg = 'String最大长度必须是正整数'
          } else if (parseInt(attribute.stringmin) > parseInt(attribute.stringmax)) {
            attribute.error = true
            attribute.errorMsg = 'String最小长度不能大于最大长度'
          } else {
            attribute.error = false
          }
        } else if (attribute.dataType === 'Struct' || (attribute.dataType === 'Array' && attribute.arraytype === 'Struct')) {
          if (typeof attribute.attributes === 'undefined' || attribute.attributes.length === 0) {
            attribute.error = true
            attribute.errorMsg = 'Struct未定义'
          } else {
            for (var i = 0; i < attribute.attributes.length; i++) {
              this.isValid(attribute.attributes[i])
              if (attribute.attributes[i].error) {
                attribute.error = true
                attribute.errorMsg = attribute.name + '属性' + (i + 1).toString() + ':' + attribute.attributes[i].errorMsg
                this.$forceUpdate()
                return
              }
            }
            attribute.error = false
          }
        } else if (attribute.dataType === 'Choice' || (attribute.dataType === 'Array' && attribute.arraytype === 'Choice')) {
          if (typeof attribute.choices === 'undefined' || Object.keys(attribute.choices).length === 0) {
            attribute.error = true
            attribute.errorMsg = 'Choice未定义'
          } else {
            for (var key in attribute.choices) {
              for (var j = 0; j < attribute.choices[key].attributes.length; j++) {
                this.isValid(attribute.choices[key].attributes[j])
                if (attribute.choices[key].attributes[j].error) {
                  attribute.error = true
                  attribute.errorMsg = attribute.name + 'Choice: ' + key + '属性' + (j + 1).toString() + ':' + attribute.choices[key].attributes[j].errorMsg
                  this.$forceUpdate()
                  return
                }
              }
            }
            attribute.error = false
          }
        } else {
          attribute.error = false
        }
      } else {
        attribute.error = true
        attribute.errorMsg = '属性未定义'
      }
      this.$forceUpdate()
    },
    clickCheckChoice (choice, next) {
      for (var i = 0; i < choice.attributes.length; i++) {
        this.isValid(choice.attributes[i])
        if (choice.attributes[i].error) {
          return
        }
      }
      if (next) {
        this.choiceInfoStep++
      } else {
        this.choiceInfoStep--
      }
    },
    clickCheck (attribute, next) {
      this.isValid(attribute)
      this.$forceUpdate()
      if (!attribute.error) {
        if (next) {
          this.$refs.stepper.next()
        } else {
          this.$refs.stepper.previous()
        }
        this.$refs.infoStepper[0].goTo(1)
      }
    },
    showDownwardChoice (choices, index) {
      return index !== (Object.keys(choices).length - 1)
    },
    showUpwardChoice (index) {
      return index !== 0
    },
    showDownward (index) {
      return index !== (Object.keys(this.attributes).length - 1)
    },
    showUpward (index) {
      return index !== 0
    },
    dataTypeChanged () {
      this.structs = []
      this.choices = {}
    },
    delAttribute (key) {
      this.$delete(this.attributes, key)
      this.$refs.stepper.previous()
    },
    delChoice (choices, key) {
      this.$delete(choices, key)
      this.$refs.choiceStepper[0].previous()
    },
    addChoice (choice) {
      this.$set(choice.attributes, choice.attributes.length, {
        name: '',
        description: '',
        optional: true,
        dataType: ''
      })
    },
    getStruct (attribute) {
      if (typeof attribute.attributes === 'undefined') {
        this.$set(attribute, 'attributes', [{
          name: '',
          description: '',
          optional: true,
          dataType: '',
          error: false,
          errorMsg: ''
        }])
      }
      return attribute.attributes
    },
    add (attribute) {
      if (attribute.dataType === 'Struct' || (attribute.dataType === 'Array' && (attribute.arraytype === 'Struct'))) {
        this.$set(attribute.attributes, attribute.attributes.length, {
          name: '',
          description: '',
          optional: true,
          dataType: '',
          error: false,
          errorMsg: ''
        })
      } else {
        this.choice.input = attribute
        this.choiceDialog = true
      }
    },
    inputChoice (attribute) {
      this.$v.choice.$touch()
      if (this.$v.choice.$error) {
        return
      }
      if (typeof attribute.choices === 'undefined') {
        this.$set(attribute, 'choices', {})
      }
      this.$set(attribute.choices, this.choice.name, {
        name: this.choice.name,
        description: this.choice.description,
        optional: true,
        dataType: '',
        error: false,
        errorMsg: ''
      })
      this.choice = {
        name: '',
        description: ''
      }
      this.choiceDialog = false
    }
  }
}
</script>
