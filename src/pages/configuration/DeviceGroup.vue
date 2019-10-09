<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
          <q-toolbar-title>
            设备组详细信息
          </q-toolbar-title>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item >
                <q-item-section avatar>
                  <q-icon color="primary" name="group_work" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{devicegroup.name}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card class="q-ma-md">
              <q-list separator>
                <q-item v-for="device in devicegroup.devices" :key="device.id">
                  <q-item-section avatar v-if="$q.screen.gt.xs">
                    <q-icon color="primary" :name="device.connected?'devices':'phonelink_off'" />
                  </q-item-section>
                  <q-item-section @click="gotoDevice(device.id)" class="cursor-pointer">
                    <q-item-label>{{device.name}}</q-item-label>
                    <q-item-label caption>{{device.deviceType.name}}</q-item-label>
                  </q-item-section>
                  <q-item-section side @click="gotoDevice(device.id)">
                    <q-btn color="secondary" size="12px" flat dense round icon="info" >
                      <q-tooltip>详情</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { http } from '../../components/http'

export default {
  name: 'device-group',
  data () {
    return {
      devicegroupId: '',
      devicegroup: {
        attDefinition: {}
      }
    }
  },
  created () {
    this.devicegroupId = this.$route.params.id
    this.getDevicegroup()
  },
  methods: {
    gotoDevice (id) {
      this.$router.push({ path: '/home/sites/root/device/' + id })
    },
    getDevicegroup () {
      let devicegroupUrl = '/devicegroups/' + this.devicegroupId
      http('get', devicegroupUrl, '', (response) => {
        this.devicegroup = response.data
      })
    },
    refresh (done) {
      done()
      this.getDevicegroup()
    }
  }
}
</script>

<style>
</style>
