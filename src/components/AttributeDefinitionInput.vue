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
          :title="getName() + '信息'"
          :caption="attribute.error?attribute.errorMsg:''"
          :done="attInfoStep > 1"
          :error="attribute.error"
        >
          <div v-if="device" class="row">
            <q-checkbox v-model="attribute.get" color="primary" label="可读取"  @input="(get) => {checkGet(get, attribute)}" />
            <q-checkbox v-model="attribute.set" color="primary" label="可设置"  @input="(set) => {checkSet(set, attribute)}" class="q-ml-sm"/>
            <q-checkbox v-model="attribute.report" color="primary" label="可上报"  @input="(report) => {checkReport(report, attribute)}" class="q-ml-sm"/>
          </div>
          <q-field :label="getName() + '名称(*)'" dense
                   hint="">
            <q-input class="self-center full-width no-outline" v-model="attribute.name" autofocus/>
          </q-field>
          <q-field :label="getName() + '描述'" dense
                   hint="">
            <q-input class="self-center full-width no-outline" v-model="attribute.description"/>
          </q-field>
          <q-field :label="getName() + '是否可空(*)'" dense
                   hint="">
            <q-checkbox class="self-bottom full-width no-outline" v-model="attribute.optional"/>
          </q-field>
          <q-field :label="getName() + '数据类型(*)'" dense
                   hint="">
            <q-select class="self-center full-width no-outline" v-model="attribute.dataType" :options="dataTypes" />
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
          :title="getName() + '附加信息'"
          :done="attInfoStep > 2"
          v-if="attribute.dataType === 'Struct' || attribute.dataType === 'Choice' || (attribute.dataType === 'Array' && (attribute.arraytype === 'Struct' || attribute.arraytype === 'Choice') )"
        >
          <div v-if="attribute.dataType === 'Struct' || (attribute.dataType === 'Array' && (attribute.arraytype === 'Struct'))">
            <attribute-definition-input :attributes="getStruct(attribute)" :attributeName="attribute.name" :name="getSubName()"></attribute-definition-input>
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
                <attribute-definition-input :attributes="getStruct(choice)" :attributeName="key" :ref="key" :name="getSubName()"></attribute-definition-input>
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
import { isValidAttribute, isValidAttributes, getAttributes } from './attribute'

export default {
  name: 'AttributeDefinitionInput',
  props: ['attributes', 'attributeName', 'name', 'subName', 'device'],
  data () {
    return {
      attStep: 0,
      attInfoStep: 1,
      structInfoStep: 0,
      choiceInfoStep: 0,
      dataTypes: ['Int', 'Decimal', 'String', 'DateTime', 'Bool', 'Enum', 'Location', 'Array', 'Struct', 'Choice'],
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
    checkGet (get, attribute) {
      if (!get && !attribute.set && !attribute.report) {
        this.checkDialog()
        attribute.get = true
      }
    },
    checkSet (set, attribute) {
      if (!set && !attribute.get && !attribute.report) {
        this.checkDialog()
        attribute.set = true
      }
    },
    checkReport (report, attribute) {
      if (!report && !attribute.set && !attribute.get) {
        this.checkDialog()
        attribute.report = true
      }
    },
    checkDialog () {
      this.$q.dialog({
        title: '属性设置',
        message: '属性是否可读取，可设置，可上报不能全部设置为不可以！',
        ok: {
          label: '确定'
        }
      })
    },
    showDelete (key) {
      return true
    },
    getTitle (attribute, key) {
      let suffix = ':'
      if (attribute.name && attribute.name.length > 0) {
        suffix = ':' + attribute.name
      }
      let name = this.getName()
      let attributeName = ''
      if (typeof this.attributeName !== 'undefined') {
        attributeName = this.attributeName
      }
      return attributeName + name + ((key + 1).toString()) + suffix
    },
    getName () {
      if (typeof this.name !== 'undefined') {
        return this.name
      } else {
        return '属性'
      }
    },
    getSubName () {
      if (typeof this.subName !== 'undefined') {
        return this.subName
      } else {
        return '属性'
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
        attribute.errorMsg = this.getName() + '名称不可空'
      } else if (typeof attribute.optional === 'undefined' || attribute.optional.length === 0) {
        attribute.error = true
        attribute.errorMsg = this.getName() + '是否可空未设置'
      } else {
        attribute.error = false
      }
    },
    canSubmit () {
      return isValidAttributes(this.attributes, this.getName(), this.getSubName())
    },
    getAttributes () {
      return getAttributes(this.attributes, this.device)
    },
    isValid (attribute) {
      isValidAttribute(attribute, this.getName(), this.getSubName())
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
      return index !== (this.attributes.length - 1)
    },
    showUpward (index) {
      return index !== 0
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
