<template>
  <q-page class="flex justify-center q-ma-md">
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 800px; max-width: 80vw;">
        <q-toolbar class="text-primary">
          <q-toolbar-title>
            设置设备属性
          </q-toolbar-title>
          <q-space />
          <q-btn icon="close" flat round dense @click="$router.back()" />
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label caption>属性</q-item-label>
                  <q-item-label>{{attribute}}</q-item-label>
                </q-item-section>
                <q-item-section side><q-btn color="primary" @click="submit">设置</q-btn></q-item-section>
              </q-item>
            </q-list>
            <q-card class="q-my-md">
              <q-list >
                <q-item>
                  <q-item-section>
                    <q-item-label caption>请求信息</q-item-label>
                  </q-item-section>
                </q-item>
                <AttributeInput :attDefinition="getDefinition()" ref="request" v-if="show"/>
              </q-list>
            </q-card>
          </q-card-section>
        </q-card>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { http } from '../../components/http'
import { stomp } from '../../components/stomp'
import AttributeInput from '../../components/AttributeInput.vue'
import store from '../../store'

export default {
  name: 'set',
  components: {
    AttributeInput
  },
  data () {
    return {
      showDialog: false,
      deviceId: '',
      attribute: '',
      attDefinition: {},
      show: false
    }
  },
  created () {
    this.deviceId = this.$route.params.id
    this.attribute = this.$route.params.attribute
    this.getDevice()
    this.showDialog = true
  },
  beforeRouteLeave: (to, from, next) => {
    store.commit('close')
    next()
  },
  methods: {
    getDefinition () {
      let definition = {}
      let d = this.attDefinition[this.attribute]
      d.optional = false
      definition[this.attribute] = this.attDefinition[this.attribute]
      return definition
    },
    getDevice () {
      let deviceUrl = '/devices/' + this.deviceId
      http('get', deviceUrl, '', (response) => {
        this.attDefinition = response.data.deviceType.attDefinition
        this.show = true
      })
    },
    submit () {
      if (this.$refs.request.canSubmit()) {
        this.$q.dialog({
          title: '提交设置',
          message: '确认提交设置请求？',
          ok: {
            label: '确定'
          }
        }).onOk((data) => {
          stomp.operate(this.deviceId, 'set', this.attribute, this.$refs.request.getInputValue(), (result) => {
            this.$q.dialog({
              title: '设置成功',
              ok: {
                label: '确定'
              }
            }).onOk((data) => {
            })
          }, () => {
          })
        })
      }
    }
  }
}
</script>

<style>
</style>
