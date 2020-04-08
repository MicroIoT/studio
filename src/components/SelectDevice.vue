<template>
  <q-dialog v-model="show" persistent >
    <q-card style="width: 700px; height: 63vh">
      <q-card-section>
        <div class="text-h6">选择设备</div>
      </q-card-section>
      <q-separator />
      <q-card-section style="height: 50vh" class="scroll">
          <q-breadcrumbs separator="|" class="q-ma-md">
            <q-breadcrumbs-el :label="this.$store.getters.getDomain.name" icon="home" @click="goto('root')" class="cursor-pointer">
            </q-breadcrumbs-el>
            <q-breadcrumbs-el
              class="cursor-pointer"
              v-for="(parent, index) in parents"
              :key="index"
              :label="parent.name + parent.siteType.name"
              icon="location_city"
              @click="goto(parent.id)">
            </q-breadcrumbs-el>
          </q-breadcrumbs>
          <q-separator />
          <q-infinite-scroll @load="loadMore" ref="scroll" >
            <q-list highlight separator>
              <q-item v-for="site in sites" :key="site.id">
                <q-item-section avatar v-if="$q.screen.gt.xs">
                  <q-icon :color="alarmAmount(site.id) > 0?'red':'primary'" name="location_city" />
                </q-item-section>
                <q-item-section @click="goto(site.id)" class="cursor-pointer">
                  <q-item-label >{{site.name}}</q-item-label>
                  <q-item-label caption >{{site.siteType.name}}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-for="device in devices" :key="device.id">
                <q-item-section avatar v-if="$q.screen.gt.xs">
                  <q-icon :color="alarmAmount(device.id) > 0?'red':'primary'" :name="device.connected?'devices':'phonelink_off'" />
                </q-item-section>
                <q-item-section @click="gotoDevice(device.id)" class="cursor-pointer">
                  <q-item-label>{{device.name}}</q-item-label>
                  <q-item-label caption>{{device.deviceType.name}}</q-item-label>
                </q-item-section>
                <q-item-section avatar >
                <q-radio  v-model="selectedDevice" :val="device"></q-radio>
                </q-item-section>
              </q-item>
            </q-list>
          </q-infinite-scroll>
        </q-card-section>
      <q-separator />
      <q-card-actions class="text-primary" style="position:absolute; bottom: 0px; right: 0px">
        <q-btn flat label="取消" v-close-popup />
        <q-btn label="确定" color="primary" @click="selected()" :disabled="selectedDevice === null"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { http } from './http'
import { mapGetters } from 'vuex'

export default {
  name: 'SelectDevice',
  props: ['multi'],
  computed: {
    ...mapGetters({
      alarmAmount: 'getNotifyObjectAlarmTotal'
    })
  },
  data () {
    return {
      show: true,
      sites: [],
      devices: [],
      parentId: '',
      parents: [],
      siteFinished: false,
      sitePageNo: 0,
      domain: '',
      selectedDevice: null
    }
  },
  created: function () {
    this.parentId = ''
    this.getParents()
    this.domain = this.$store.getters.getDomain.name
  },
  methods: {
    selected () {
      this.$emit('return', this.selectedDevice)
      this.show = false
    },
    gotoSite (id) {
      var page = {
        name: 'site',
        params: { id: id }
      }
      this.$router.push(page)
    },
    getParents () {
      if (this.parentId !== '') {
        let siteUrl = '/sites/' + this.parentId
        http('get', siteUrl, null, (response) => {
          var parent
          var site = response.data
          do {
            parent = { id: site.id, name: site.name, siteType: site.siteType }
            this.parents.splice(0, 0, parent)
            site = site.location
          } while (site.id !== this.$store.getters.getDomain.id)
        })
      }
    },
    goto (pId) {
      if (pId === 'root') {
        pId = ''
      }
      if (this.parentId !== pId) {
        this.parentId = pId
        this.parents = []
        this.getParents()
        this.refreshPage()
      }
    },
    refresh (done) {
      this.refreshPage()
      done()
    },
    refreshList () {
      this.parentId = ''
      this.parents = []
      this.getParents()
      this.domain = this.$store.getters.getDomain.name
      this.refreshPage()
    },
    refreshPage () {
      this.siteFinished = false
      this.sitePageNo = 0
      this.sites = []
      this.devices = []
      this.$refs.scroll.reset()
      this.$refs.scroll.resume()
      this.$refs.scroll.trigger()
    },
    loadMore (pageNo, done) {
      pageNo--
      if (!this.siteFinished) {
        let pid
        if (this.parentId === '') {
          pid = { params: { currentPage: pageNo, locationId: this.$store.getters.getDomain.id } }
        } else {
          pid = { params: { currentPage: pageNo, locationId: this.parentId } }
        }

        http('get', '/sites', pid, (response) => {
          done()
          this.sitePageNo++
          if (response.data.totalElements > 0) {
            this.sites.push(...response.data.content)
            if (response.data.last) {
              this.siteFinished = true
            }
          } else {
            this.siteFinished = true
          }
        })
      } else {
        let sid
        let page = pageNo - this.sitePageNo
        if (page < 0) {
          return
        }
        if (this.parentId === '') {
          sid = { params: { currentPage: page, locationId: this.$store.getters.getDomain.id } }
        } else {
          sid = { params: { currentPage: page, locationId: this.parentId } }
        }

        http('get', '/devices', sid, (response) => {
          this.devices.push(...response.data.content)
          if (response.data.last) {
            this.$refs.scroll.stop()
          }
          done()
        })
      }
    }
  }
}
</script>

<style>
</style>
