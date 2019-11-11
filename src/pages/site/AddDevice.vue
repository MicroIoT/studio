<template>
  <q-page class="flex justify-center q-ma-md">
      <q-dialog v-model="showDialog" persistent>
        <q-card style="width: 1000px; max-width: 80vw;">
          <q-toolbar class="text-primary">
            <q-toolbar-title>
              添加设备
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
              title="设备基本信息"
              :done="step > 1"
            >
              <q-field label="父场地" dense>
                <q-input class="self-center full-width no-outline" readonly v-model="parentName"/>
              </q-field>
              <q-field label="设备类型" dense
                       hint=""
                       :error="$v.device.devicetype.$error"
                       error-message="设备类型不能为空">
                <q-select class="self-center full-width no-outline" v-model="device.devicetype" :options="devicetypes" @input="typeChanged()" autofocus/>
              </q-field>
              <q-field label="设备名称" dense
                       hint=""
                       :error="$v.device.name.$error"
                       error-message="设备名称不能为空">
                <q-input class="self-center full-width no-outline" v-model="device.name"/>
              </q-field>

              <q-stepper-navigation>
                <q-btn @click="initDevice" color="primary" label="继续" />
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="2"
              title="设备静态属性值"
              :done="step > 2"
            >
              <q-stepper
                ref="stepper"
                v-model="attStep"
                vertical
                color="primary"
                animated
                v-if="getSelectedDeviceType() !== null"
              >
                <q-step
                  v-for="(value, key, index) in getSelectedDeviceType()"
                  :name="index"
                  :title="key"
                  :caption="value.description"
                  icon="edit"
                  :key="key"
                  :error="value.error"
                >
                  <AttributeInput :attDefinition="getDefinition(key, value)" :ref="key"/>
                  <q-stepper-navigation>
                    <q-btn color="primary" label="继续"  v-if="showDownward(index)" @click="clickCheck(key, value, index, true)"/>
                    <q-btn color="primary" label="回退" class="q-ml-sm" v-if="showUpward(index)" @click="clickCheck(key, value, index, false)"/>
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>

              <q-stepper-navigation>
                <div class="row">
                  <q-btn @click="step = 1" color="primary" label="回退" class="q-ml-sm" />
                  <q-space />
                  <q-btn @click="finish" color="primary" label="提交" v-show="showFinish"/>
                </div>
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
      </q-card>
      </q-dialog>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { http } from '../../components/http'
import AttributeInput from '../../components/AttributeInput.vue'
import store from '../../store'

export default {
  components: {
    AttributeInput
  },
  name: 'adddevice',
  data () {
    return {
      showDialog: false,
      step: 1,
      attStep: 0,
      parentId: '',
      parentName: '',
      parent: '',
      devicetypeDefs: [],
      devicetypes: [],
      showFinish: false,
      device: {
        name: '',
        devicetype: '',
        attributes: {}
      }
    }
  },
  validations: {
    device: {
      name: { required },
      devicetype: { required }
    }
  },
  created: function () {
    this.parentId = this.$route.params.parentId
    this.getParent()
    this.getDevicetypes()
    this.showDialog = true
  },
  beforeRouteLeave: (to, from, next) => {
    store.commit('close')
    next()
  },
  methods: {
    typeChanged () {
      this.device.attributes = {}
      this.attStep = 0
      this.showFinish = false
    },
    finish () {
      if (this.getSelectedDeviceType() !== null) {
        let k = Object.keys(this.getSelectedDeviceType()).length - 1
        let key = Object.keys(this.getSelectedDeviceType())[k]
        if (this.$refs[key][0].canSubmit()) {
          let v = this.$refs[key][0].getInputValue()
          let k = Object.keys(v)[0]
          let val = v[k]
          this.device.attributes[key] = val
        }
      }

      var data = {
        'name': this.device.name,
        'deviceType': this.device.devicetype,
        'locationId': this.parentId === 'root' ? this.$store.getters.getDomain.id : this.parentId,
        'attInfos': this.device.attributes
      }
      http('post', '/devices', data, (response) => {
        let account = '账号：' + response.data.deviceAccount.username + '<br>密码：' + response.data.deviceAccount.password + '</span>'
        this.$q.dialog({
          title: '添加设备',
          message: '设备: ' + response.data.string + ' 添加成功!<br><br><span class="text-red">请妥善保管设备账号信息<br>' + account,
          ok: {
            label: '确定'
          },
          html: true,
          persistent: true
        }).onOk((data) => {
          if (this.parentId !== 'root') {
            this.$router.replace({ path: '/home/sites/' + this.parentId, query: { fresh: true } })
          } else {
            this.$router.replace({ path: '/home/sites/root', query: { fresh: true } })
          }
        })
      })
    },
    clickCheck (key, value, index, next) {
      if (this.$refs[key][0].canSubmit()) {
        if (!value.error) {
          let v = this.$refs[key][0].getInputValue()
          let k = Object.keys(v)[0]
          let val = v[k]
          this.device.attributes[key] = val
          if (next) {
            if (index === (Object.keys(this.getSelectedDeviceType()).length - 2)) {
              this.showFinish = true
            }
            this.$refs.stepper.next()
          } else {
            this.$refs.stepper.previous()
            this.showFinish = false
          }
        }
      }
    },
    showDownward (index) {
      return index !== (Object.keys(this.getSelectedDeviceType()).length - 1)
    },
    showUpward (index) {
      return index !== 0
    },
    getDefinition (key, value) {
      let definition = {}
      definition[key] = value
      return definition
    },
    getSelectedDeviceType () {
      for (var i = 0; i < this.devicetypeDefs.length; i++) {
        if (this.devicetypeDefs[i].name === this.device.devicetype) {
          return this.devicetypeDefs[i].staticAttDefinition
        }
      }
    },
    initDevice () {
      this.$v.device.$touch()
      if (this.$v.device.$error) {
        return
      }
      this.step = 2
      let definition = this.getSelectedDeviceType()
      if (definition === null) {
        this.showFinish = true
      }
    },
    getDevicetypes () {
      http('get', '/devicetypes/list', null, (response) => {
        this.devicetypeDefs = response.data
        for (var key in this.devicetypeDefs) {
          this.devicetypes.push(this.devicetypeDefs[key].name)
        }
      })
    },
    getParent () {
      if (this.parentId !== 'root') {
        let url = '/sites/' + this.parentId
        http('get', url, '', (response) => {
          this.parent = response.data
          this.parentName = this.parent.string
        })
      } else {
        this.parentName = this.$store.getters.getDomain.name
      }
    }
  }
}
</script>

<style>
</style>
