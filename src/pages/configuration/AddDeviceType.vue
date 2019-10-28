<template>
  <q-page class="flex justify-center q-ma-md">
    <q-dialog v-model="showDialog" persistent>
        <q-card style="width: 800px; max-width: 80vw;">
          <q-toolbar class="text-primary">
            <q-toolbar-title>
              添加设备类型
            </q-toolbar-title>
            <q-space />
            <q-btn icon="close" flat round dense @click="$router.back()" />
          </q-toolbar>
          <q-stepper
            v-model="step"
            vertical
            color="primary"
            animated
          >
            <q-step
              :name="1"
              title="设备类型基本信息"
              :done="step > 1"
            >
              <q-field label="设备类型名称" dense
                       hint=""
                       :error="$v.devicetype.name.$error"
                       error-message="设备类型名称不能为空">
                <q-input class="self-center full-width no-outline" v-model="devicetype.name" autofocus/>
              </q-field>
              <q-field label="设备类型描述" dense
                       hint="">
                <q-input class="self-center full-width no-outline" v-model="devicetype.description"/>
              </q-field>

              <q-stepper-navigation>
                <q-btn @click="initSiteType" color="primary" label="继续" />
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="2"
              title="设备类型动态属性信息（动态属性是属性值保存在设备中的属性）"
              :caption="devicetype.attributes.error?devicetype.attributes.errorMsg:''"
              :done="step > 2"
              :error="devicetype.attributes.error"
            >
              <attribute-definition-input :attributes="devicetype.attributes" ref="attributes" name="动态属性" device="true"></attribute-definition-input>
              <q-stepper-navigation>
                <div class="row">
                  <q-btn @click="addAttribute" color="primary" label="添加" class="q-ml-sm" />
                  <q-btn @click="checkAttributes(true)" color="primary" label="继续" class="q-ml-sm"/>
                  <q-btn @click="checkAttributes(false)" color="primary" label="回退" class="q-ml-sm" />
                </div>
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="3"
              title="设备类型静态属性信息（静态属性是属性值保存在平台中的属性）"
              :caption="devicetype.staticAttributes.error?devicetype.staticAttributes.errorMsg:''"
              :done="step > 3"
              :error="devicetype.staticAttributes.error"
            >
              <attribute-definition-input :attributes="devicetype.staticAttributes" ref="staticattribute" name="静态属性"></attribute-definition-input>
              <q-stepper-navigation>
                <div class="row">
                  <q-btn @click="addStaticAttribute" color="primary" label="添加" class="q-ml-sm" />
                  <q-btn @click="checkStaticAttributes(true)" color="primary" label="继续" class="q-ml-sm"/>
                  <q-btn @click="checkStaticAttributes(false)" color="primary" label="回退" class="q-ml-sm" />
                </div>
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="4"
              title="设备操作类型信息"
              :done="step > 4"
            >
              <q-stepper
                ref="actions"
                v-model="actionsStep"
                vertical
                animated
                color="primary"
                v-if="Object.keys(devicetype.actionTypes).length > 0"
              >
                <q-step
                  :name="index"
                  :title="key + (actionType.description?': ' + actionType.description: '')"
                  :caption="devicetype.actionTypes[key].error?devicetype.actionTypes[key].errorMsg:''"
                  :done="actionsStep > 1"
                  v-for="(actionType, key, index) in devicetype.actionTypes"
                  :key="key"
                  :error="devicetype.actionTypes[key].error"
                >
                  <q-stepper
                    ref="action"
                    v-model="actionType.step"
                    vertical
                    animated
                    color="primary"
                  >
                    <q-step
                      v-if="actionType.request && actionType.request.length > 0"
                      :name="1"
                      :title="key + '请求信息'"
                      :caption="actionType.request.error?actionType.request.errorMsg:''"
                      :done="actionType.step > 1"
                      :error="actionType.request.error"
                    >
                      <attribute-definition-input :attributes="actionType.request" :ref="key + 'request'"  name="请求参数" subName="参数"></attribute-definition-input>
                      <q-stepper-navigation>
                        <div class="row">
                          <!--<q-btn color="primary" label="添加" class="q-ml-sm" @click="addRequest(actionType.request)"/>-->
                          <q-btn @click="clickCheckRequest(actionType)" color="primary" label="继续" class="q-ml-sm" v-if="actionType.response && actionType.response.length > 0"/>
                          <q-btn @click="delRequest(actionType)" color="primary" label="删除"  class="q-ml-sm"/>
                        </div>
                      </q-stepper-navigation>
                    </q-step>
                    <q-step
                      v-if="actionType.response && actionType.response.length > 0"
                      :name="2"
                      :title="key + '响应信息'"
                      :caption="actionType.response.error?actionType.response.errorMsg:''"
                      :error="actionType.response.error"
                    >
                      <attribute-definition-input :attributes="actionType.response" :ref="key + 'response'"  name="响应参数" subName="参数"></attribute-definition-input>
                      <q-stepper-navigation>
                        <div class="row">
                          <!--<q-btn color="primary" label="添加" class="q-ml-sm" @click="addResponse(actionType.response)"/>-->
                          <q-btn @click="clickCheckResponse(actionType)" color="primary" label="回退" class="q-ml-sm" v-if="actionType.request && actionType.request.length > 0"/>
                          <q-btn @click="delResponse(actionType)" color="primary" label="删除"  class="q-ml-sm"/>
                        </div>
                      </q-stepper-navigation>
                    </q-step>
                  </q-stepper>
                  <q-stepper-navigation>
                    <div class="row">
                      <q-btn @click="addActionRequest(actionType)" color="primary" label="添加请求" v-if="typeof actionType.request === 'undefined' || actionType.request.length === 0"/>
                      <q-btn @click="addActionResponse(actionType)" color="primary" label="添加响应" class="q-ml-sm" v-if="typeof actionType.response === 'undefined' || actionType.response.length === 0" />
                      <q-btn color="primary" label="继续"  @click="clickCheckActionType(actionType, true)" v-if="showNext(index)" class="q-ml-sm"/>
                      <q-btn color="primary" label="回退" @click="clickCheckActionType(actionType, false)" v-if="showPrevious(index)" class="q-ml-sm"/>
                      <q-btn @click="delActionType(key)" color="primary" label="删除"  class="q-ml-sm"/>
                    </div>
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>
              <q-stepper-navigation>
                <div class="row">
                  <q-btn @click="addActionType" color="primary" label="添加" class="q-ml-sm" />
                  <q-btn @click="checkActions(true)" color="primary" label="继续" class="q-ml-sm"/>
                  <q-btn @click="checkActions(false)" color="primary" label="回退" class="q-ml-sm" />
                </div>
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="5"
              title="设备告警类型信息"
              :caption="devicetype.alarmTypes.error?devicetype.alarmTypes.errorMsg:''"
              :done="step > 5"
              :error="devicetype.alarmTypes.error"
            >
              <attribute-definition-input :attributes="devicetype.alarmTypes" ref="alarmtypes" name="告警类型" subName="参数"></attribute-definition-input>
              <q-stepper-navigation>
                <div class="row">
                  <q-btn @click="addAlarmType" color="primary" label="添加" class="q-ml-sm" />
                  <q-btn @click="checkAlarms(false)" color="primary" label="回退" class="q-ml-sm" />
                  <q-space />
                  <q-btn @click="finish" color="primary" label="提交" v-show="showFinish"/>
                </div>
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card>
    </q-dialog>
    <q-dialog v-model="actionDialog" persistent>
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">操作类型</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="actionType.name" label="请输入操作类型名称(*)" :error="$v.actionType.name.$error" error-message="操作类型名称不能为空" autofocus />
        </q-card-section>
        <q-card-section>
          <q-input v-model="actionType.description" label="请输入操作类型描述" />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn label="确定" color="primary" @click="inputActionType()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { http } from '../../components/http'
import AttributeDefinitionInput from '../../components/AttributeDefinitionInput.vue'
import { isValidAttributes, getAttributes, getAttribute } from '../../components/attribute'

export default {
  components: {
    AttributeDefinitionInput
  },
  name: 'adddevicetype',
  data () {
    return {
      showDialog: false,
      step: 1,
      showFinish: false,
      actionsStep: 0,
      devicetype: {
        name: '',
        description: '',
        attributes: [],
        staticAttributes: [],
        actionTypes: {},
        alarmTypes: []
      },
      actionDialog: false,
      actionType: {
        name: '',
        description: '',
        input: ''
      }
    }
  },
  validations: {
    devicetype: {
      name: { required }
    },
    actionType: {
      name: { required }
    }
  },
  created: function () {
    this.showDialog = true
  },
  methods: {
    checkAttributes (next) {
      if (isValidAttributes(this.devicetype.attributes)) {
        next ? this.step = 3 : this.step = 1
      }
    },
    checkStaticAttributes (next) {
      if (isValidAttributes(this.devicetype.staticAttributes)) {
        next ? this.step = 4 : this.step = 2
      }
    },
    checkActions (next) {
      for (var key in this.devicetype.actionTypes) {
        if (typeof this.devicetype.actionTypes[key].request !== 'undefined') {
          isValidAttributes(this.devicetype.actionTypes[key].request, '请求参数', '参数')
          if (this.devicetype.actionTypes[key].request.error) {
            this.devicetype.actionTypes[key].error = true
            this.devicetype.actionTypes[key].errorMsg = key + '请求参数' + this.devicetype.actionTypes[key].request.errorMsg
            return
          }
        }
        if (typeof this.devicetype.actionTypes[key].response !== 'undefined') {
          isValidAttributes(this.devicetype.actionTypes[key].response, '响应参数', '参数')
          if (this.devicetype.actionTypes[key].response.error) {
            this.devicetype.actionTypes[key].error = true
            this.devicetype.actionTypes[key].errorMsg = key + '响应参数' + this.devicetype.actionTypes[key].response.errorMsg
            return
          }
        }
        this.devicetype.actionTypes[key].error = false
      }
      next ? this.step = 5 : this.step = 3
    },
    checkAlarms (next) {
      if (isValidAttributes(this.devicetype.alarmTypes, '告警类型', '参数')) {
        if (!next) { this.step = 4 }
      }
    },
    finish () {
      let data = {
        name: this.devicetype.name,
        description: this.devicetype.description,
        optional: false,
        dataType: 'Class'
      }
      if (isValidAttributes(this.devicetype.attributes)) {
        let attributes = getAttributes(this.devicetype.attributes, true)
        if (attributes.length > 0) {
          data.additional = attributes
        }
      } else {
        return
      }
      if (isValidAttributes(this.devicetype.staticAttributes)) {
        let staticAtt = getAttributes(this.devicetype.staticAttributes, false)
        if (staticAtt.length > 0) {
          data.staticAttTypeInfo = staticAtt
        }
      } else {
        return
      }
      if (isValidAttributes(this.devicetype.alarmTypes, '告警类型')) {
        let alarm = getAttributes(this.devicetype.alarmTypes, false)
        if (alarm.length > 0) {
          data.alarmTypeInfos = alarm
        }
      } else {
        return
      }
      let actions = []
      for (var key in this.devicetype.actionTypes) {
        let request
        if (typeof this.devicetype.actionTypes[key].request !== 'undefined') {
          request = getAttribute(this.devicetype.actionTypes[key].request[0], false)
        }
        let response
        if (typeof this.devicetype.actionTypes[key].response !== 'undefined') {
          response = getAttribute(this.devicetype.actionTypes[key].response[0], false)
        }
        let action = {
          name: key,
          description: this.devicetype.actionTypes[key].description
        }
        action.requestInfo = request
        action.responseInfo = response
        actions.push(action)
      }
      data.actionTypeInfos = actions
      http('post', '/devicetypes', data, (response) => {
        this.$q.dialog({
          title: '添加设备类型',
          message: '设备类型: ' + this.devicetype.name + ' 添加成功!',
          ok: {
            label: '确定'
          }
        }).onOk((data) => {
          this.$router.replace({ path: '/home/devicetypes' })
        })
      })
    },
    addAttribute () {
      this.devicetype.attributes.push({ get: true, set: true, report: true })
    },
    addStaticAttribute () {
      this.devicetype.staticAttributes.push({})
    },
    addActionType () {
      this.actionDialog = true
    },
    addAlarmType () {
      this.devicetype.alarmTypes.push({})
    },
    initSiteType () {
      this.$v.devicetype.$touch()
      if (this.$v.devicetype.$error) {
        return
      }
      this.step = 2
      this.showFinish = true
    },
    addRequest (request) {
      this.$set(request, request.length, {})
    },
    delRequest (actionType) {
      this.$delete(actionType, 'request')
      actionType.step = 2
    },
    delResponse (actionType) {
      this.$delete(actionType, 'response')
      actionType.step = 1
    },
    addResponse (response) {
      this.$set(response, response.length, {})
    },
    addActionRequest (actionType) {
      this.$set(actionType, 'request', [{}])
      actionType.step = 1
    },
    addActionResponse (actionType) {
      this.$set(actionType, 'response', [{}])
      actionType.step = 2
    },
    inputActionType () {
      this.$set(this.devicetype.actionTypes, this.actionType.name, {
        request: [{
        }],
        response: [{
        }],
        description: this.actionType.description,
        step: 1
      })
      this.actionType = {
        name: '',
        description: ''
      }
      this.actionDialog = false
    },
    delActionType (key) {
      this.$delete(this.devicetype.actionTypes, key)
    },
    showNext (index) {
      return index !== (Object.keys(this.devicetype.actionTypes).length - 1)
    },
    showPrevious (index) {
      return index !== 0
    },
    clickCheckRequest (actionType) {
      if (!isValidAttributes(actionType.request, '请求参数')) {
        return false
      }
      actionType.step = 2
    },
    clickCheckResponse (actionType) {
      if (!isValidAttributes(actionType.response, '请求参数')) {
        return false
      }
      actionType.step = 1
    },
    clickCheckActionType (actionType, next) {
      if (!isValidAttributes(actionType.request, '请求参数')) {
        return false
      }
      if (!isValidAttributes(actionType.response, '响应参数')) {
        return false
      }
      if (next) {
        this.actionsStep++
      } else {
        this.actionsStep--
      }
    }
  }
}
</script>

<style>
</style>
