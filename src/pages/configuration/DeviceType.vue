<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
          <q-toolbar-title>
            设备类型详细信息
          </q-toolbar-title>
        </q-toolbar>

        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item >
                <q-item-section avatar>
                  <q-icon color="primary" name="devices" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{devicetype.name}}</q-item-label>
                  <q-item-label caption>{{devicetype.description}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-card>
              <AttributeDefinition title="设备静态属性" :attributeDefinition="devicetype.staticAttDefinition"/>
              <AttributeDefinition title="设备动态属性" :attributeDefinition="devicetype.attDefinition"/>
              <q-expansion-item
                class="q-ma-md"
                switch-toggle-side
                expand-separator
                header-class="text-primary"
                label="设备操作类型"
                v-if="devicetype.actionTypes && Object.keys(devicetype.actionTypes).length > 0" @show="setActionType">
                <q-tabs dense align="center" narrow-indicator no-caps active-color="primary" v-model="actionTypeSelected">
                  <q-tab :name="key" :label="key" v-for="(value, key) in devicetype.actionTypes" :key="key"/>
                </q-tabs>
                <q-separator />
                <q-tab-panels v-model="actionTypeSelected">
                  <q-tab-panel :name="key"  v-for="(value, key) in devicetype.actionTypes" :key="key" >
                    <q-field dense  >
                      <template v-slot:control>
                        <div class="self-center full-width no-outline" tabindex="0">{{value.description}}</div>
                      </template>
                    </q-field>
                    <AttributeDefinition title="操作请求属性" :attributeDefinition="value.request"/>
                    <AttributeDefinition title="操作响应属性" :attributeDefinition="value.response"/>
                  </q-tab-panel>
                </q-tab-panels>
              </q-expansion-item>
              <AttributeDefinition title="设备告警类型" :attributeDefinition="devicetype.alarmTypes"/>
            </q-card>

          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { http } from '../../components/http'
import { getTypeInfo } from '../../components/util'
import AttributeDefinition from '../../components/AttributeDefinition'

export default {
  components: {
    AttributeDefinition
  },
  name: 'device-type',
  data () {
    return {
      devicetypeId: '',
      devicetype: {
        alarmTypes: []
      },
      actionTypeSelected: ''
    }
  },
  created () {
    this.devicetypeId = this.$route.params.id
    this.getDevicetype()
  },
  methods: {
    setActionType () {
      this.actionTypeSelected = Object.keys(this.devicetype.actionTypes)[0]
    },
    getTypeInfo (dataType) {
      return getTypeInfo(dataType)
    },
    getDevicetype () {
      let devicetypeUrl = '/devicetypes/' + this.devicetypeId
      http('get', devicetypeUrl, '', (response) => {
        this.devicetype = response.data
      })
    },
    refresh (done) {
      done()
      this.getDevicetype()
    }
  }
}
</script>

<style>
</style>
