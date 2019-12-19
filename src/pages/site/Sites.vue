<template>
  <q-page class="flex justify-center q-ma-md ">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="view_day" />
          <q-toolbar-title>
            设备
          </q-toolbar-title>
          <q-btn flat round dense icon="more_vert">
            <q-menu>
              <q-list >
                <q-item clickable v-close-popup @click="addSite">
                  <q-item-section avatar>
                    <q-icon color="primary" name="location_city" />
                  </q-item-section>
                  <q-item-section>添加场地</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="addDevice">
                  <q-item-section avatar>
                    <q-icon color="primary" name="devices" />
                  </q-item-section>
                  <q-item-section>添加设备</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
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
                  <q-item-section side >
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn color="secondary" size="12px" flat dense round icon="info" @click="gotoSite(site.id)">
                        <q-tooltip>详情</q-tooltip>
                      </q-btn>
                      <q-btn size="12px" flat dense round icon="edit" color="secondary" @click="renameSite(site)">
                        <q-tooltip>重命名</q-tooltip>
                      </q-btn>
                      <q-btn size="12px" flat dense round icon="delete" color="red" @click="delSite(site.id)">
                        <q-tooltip>删除场地</q-tooltip>
                      </q-btn>
                    </div>
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
                  <q-item-section side >
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn color="secondary" size="12px" flat dense round icon="info" @click="gotoDevice(device.id)">
                        <q-tooltip>详情</q-tooltip>
                      </q-btn>
                      <q-btn size="12px" flat dense round icon="edit" color="secondary" @click="renameDevice(device)">
                        <q-tooltip>重命名</q-tooltip>
                      </q-btn>
                      <q-btn size="12px" flat dense round icon="delete" color="red" @click="delDevice(device.id)">
                        <q-tooltip>删除设备</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-infinite-scroll>
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { http } from '../../components/http'
import { mapGetters } from 'vuex'

export default {
  name: 'sites',
  data () {
    return {
      sites: [],
      devices: [],
      parentId: '',
      parents: [],
      siteFinished: false,
      sitePageNo: 0,
      domain: ''
    }
  },
  computed: {
    ...mapGetters({
      alarmAmount: 'getNotifyObjectAlarmTotal'
    })
  },
  created: function () {
    if (this.domain !== this.$store.getters.getDomain.name && this.$route.params.parentId !== 'root') {
      this.$router.replace('/home/sites/root')
    }
    this.parentId = this.$route.params.parentId
    if (this.parentId === 'root') {
      this.parentId = ''
    }
    this.getParents()
    this.domain = this.$store.getters.getDomain.name
  },
  activated: function () {
    if ((this.parentId !== this.$route.params.parentId && this.parentId !== '' && this.$route.params.parentId !== 'root') ||
      (this.parentId === '' && this.$route.params.parentId !== 'root') ||
      (this.parentId !== '' && this.$route.params.parentId === 'root') ||
      this.$route.query.fresh ||
      this.domain !== this.$store.getters.getDomain.name) {
      this.parents = []
      if (this.domain !== this.$store.getters.getDomain.name) {
        this.parentId = 'root'
        this.domain = this.$store.getters.getDomain.name
      } else {
        this.parentId = this.$route.params.parentId
      }
      if (this.parentId === 'root') {
        this.parentId = ''
      }
      this.getParents()
      this.refreshPage()
    }
  },
  watch: {
    parentId: function (val, oldVal) {
      this.$emit('change', val)
    }
  },
  methods: {
    renameDevice (device) {
      this.$q.dialog({
        title: '重命名',
        message: '请输入设备名称',
        prompt: {
          type: 'text',
          model: device.name
        },
        ok: {
          label: '确定'
        }
      }).onOk((data) => {
        let editUrl = '/devices/name'
        let info = {
          'id': device.id,
          'name': data
        }
        http('patch', editUrl, info, (response) => {
          this.refreshPage()
        })
      })
    },
    renameSite (site) {
      this.$q.dialog({
        title: '重命名',
        message: '请输入场地名称',
        prompt: {
          type: 'text',
          model: site.name
        },
        ok: {
          label: '确定'
        }
      }).onOk((data) => {
        let editUrl = '/sites/name'
        let info = {
          'id': site.id,
          'name': data
        }
        http('patch', editUrl, info, (response) => {
          this.refreshPage()
        })
      })
    },
    delSite (id) {
      this.$q.dialog({
        title: '删除场地',
        message: '场地相关所有告警，事件，配置等信息都将被删除，确定删除该场地么？',
        ok: {
          label: '删除',
          color: 'red'
        },
        cancel: {
          label: '取消'
        },
        persistent: true
      }).onOk((data) => {
        let delUrl = '/sites/' + id
        http('delete', delUrl, '', (response) => {
          this.refreshPage()
        })
      })
    },
    delDevice (id) {
      this.$q.dialog({
        title: '删除设备',
        message: '设备相关所有告警，事件，配置等信息都将被删除，确定删除该设备么？',
        ok: {
          label: '删除',
          color: 'red'
        },
        cancel: {
          label: '取消'
        },
        persistent: true
      }).onOk((data) => {
        let delUrl = '/devices/' + id
        http('delete', delUrl, '', (response) => {
          this.refreshPage()
        })
      })
    },
    addSite () {
      let parent
      if (this.parentId === '') {
        parent = 'root'
      } else {
        parent = this.parentId
      }
      let url = '/home/sites/' + parent + '/addsite'
      this.$router.push({ path: url })
    },
    addDevice () {
      let parent
      if (this.parentId === '') {
        parent = 'root'
      } else {
        parent = this.parentId
      }
      let url = '/home/sites/' + parent + '/adddevice'
      this.$router.push({ path: url })
    },
    gotoDevice (id) {
      var page = {
        name: 'device',
        params: { id: id }
      }
      this.$router.push(page)
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
        if (pId === '') {
          this.$router.replace('/home/sites/root')
        } else {
          this.$router.replace('/home/sites/' + this.parentId)
        }
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
