<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
            <q-toolbar-title>
              设备详细信息
            </q-toolbar-title>

            <q-btn flat round dense icon="more_vert" >
              <q-menu>
                <q-list >
                  <Favorite :name="device.string" type="Device" :id="deviceId"></Favorite>
                  <Subscribe :name="device.string" type="Device" :id="deviceId" v-if="myDevice"></Subscribe>
                </q-list>
              </q-menu>
            </q-btn>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item >
                <q-item-section avatar>
                  <q-icon :color="alarmAmount(device.id) > 0 && myDevice?'red':'primary'"  :name="device.connected?'devices':'phonelink_off'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{device.string}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card >
              <q-field stack-label class="q-ma-md" label="设备类型">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control >
                  <div @click="gotoDeviceType(device.deviceType.id)" class="self-center full-width no-outline" tabindex="0">{{device.deviceType.name}}</div>
                </template>
                <template v-slot:append>
                  <q-btn color="secondary" size="12px" flat dense round icon="info" @click="gotoDeviceType(device.deviceType.id)">
                  </q-btn>
                </template>
            </q-field>
            <q-field stack-label class="q-ma-md" label="设备场地">
              <template v-slot:prepend>
                <q-icon name="event" color="primary"/>
              </template>
              <template v-slot:control  @click="gotoSite(device.location)">
                <div @click="gotoSite(device.location)" class="self-center full-width no-outline" tabindex="0">{{device.location && device.location.type === "site"?device.location.string:"/"}}</div>
              </template>
              <template v-slot:append>
                <q-btn color="secondary" size="12px" flat dense round icon="info" @click="gotoSite(device.location)">
                </q-btn>
              </template>
            </q-field>

              <AttributeValue title="设备静态属性" :attributeValue="device.attributes" v-if="device.attributes && Object.keys(device.attributes).length > 0"/>

              <q-expansion-item
                class="q-ma-md"
                switch-toggle-side
                expand-separator
                header-class="text-primary"
                label="设备动态属性"
                v-if="device.deviceType.attDefinition && Object.keys(device.deviceType.attDefinition).length > 0">
                <q-list separator>
                  <q-item v-for="(value, key) in device.deviceType.attDefinition" :key="key">
                    <q-item-section>
                      <q-item-label color="black">{{key}}</q-item-label>
                      <q-item-label caption>{{value.description}}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="myDevice" >
                      <div class="q-gutter-md q-mb-md">
                        <q-btn color="primary" v-if="value.get" @click="gotoGet(key)" >读取</q-btn>
                        <q-btn color="primary" v-if="value.set" @click="gotoSet(key)" >设置</q-btn>
                        <q-btn color="primary" v-if="value.report" @click="gotoEvents(key)" >查询</q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>

              <q-expansion-item
                class="q-ma-md"
                switch-toggle-side
                expand-separator
                header-class="text-primary"
                label="设备操作"
                v-if="device.deviceType.actionTypes && Object.keys(device.deviceType.actionTypes).length > 0">
                <q-list separator>
                  <q-item v-for="(value, key) in device.deviceType.actionTypes" :key="key">
                    <q-item-section>
                      <q-item-label color="black">{{key}}</q-item-label>
                      <q-item-label caption>{{value.description}}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="myDevice" >
                      <q-btn color="primary" @click="gotoAction(key)">执行</q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import { http } from '../../components/http'
import AttributeValue from '../../components/AttributeValue'
import Favorite from '../../components/Favorite'
import Subscribe from '../../components/Subscribe'

export default {
  components: {
    AttributeValue, Favorite, Subscribe
  },
  name: 'device',
  data () {
    return {
      myDevice: false,
      selectedParam: '',
      deviceId: '',
      device: {
        site: [],
        deviceType: {
          actionTypes: {}
        },
        deviceAccount: {
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      alarmAmount: 'getNotifyObjectAlarmTotal',
      domain: 'getDomain'
    })
  },
  created: function () {
    this.deviceId = this.$route.params.id
    this.getDevice()
    this.isMyDevice()
  },
  methods: {
    isMyDevice () {
      if (this.$store.getters.getCurrentUser.isArea) {
        let deviceUrl = '/devices/area/' + this.deviceId
        http('get', deviceUrl, '', (response) => {
          this.myDevice = response.data
        })
      } else {
        this.myDevice = true
      }
    },
    gotoEvents (attribute) {
      var page = {
        name: 'events',
        params: { id: this.deviceId, attribute: attribute }
      }
      this.$router.push(page)
    },
    gotoGet (attribute) {
      if (this.domain) {
        var page = {
          name: 'get',
          params: { id: this.deviceId, attribute: attribute }
        }
        this.$router.push(page)
      } else {
        this.$q.notify({
          message: 'please choose domain first'
        })
      }
    },
    gotoSet (attribute) {
      if (this.domain) {
        var page = {
          name: 'set',
          params: { id: this.deviceId, attribute: attribute }
        }
        this.$router.push(page)
      } else {
        this.$q.notify({
          message: 'please choose domain first'
        })
      }
    },
    gotoAction (action) {
      if (this.domain) {
        var page = {
          name: 'action',
          params: { id: this.deviceId, action: action }
        }
        this.$router.push(page)
      } else {
        this.$q.notify({
          message: 'please choose domain first'
        })
      }
    },
    gotoSite (site) {
      if (site.type === 'domain') {
        this.$router.push({ path: '/home/sites/root' })
      } else {
        this.$router.push({ path: '/home/sites/' + site.id })
      }
    },
    gotoDeviceType (devicetypeId) {
      var page = {
        name: 'devicetype',
        params: { id: devicetypeId }
      }
      this.$router.push(page)
    },
    getDevice () {
      let deviceUrl = '/devices/' + this.deviceId
      http('get', deviceUrl, '', (response) => {
        this.device = response.data
      })
    },
    refresh (done) {
      done()
      this.getDevice()
      this.isMyDevice()
    }
  }
}
</script>

<style>
</style>
