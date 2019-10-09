<template>
  <q-page class="flex justify-center q-ma-md ">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="view_day" />
          <q-toolbar-title>
            设备
          </q-toolbar-title>
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
                    <q-icon color="primary" name="location_city" />
                  </q-item-section>
                  <q-item-section @click="goto(site.id)" class="cursor-pointer">
                    <q-item-label >{{site.name}}</q-item-label>
                    <q-item-label caption >{{site.siteType.name}}</q-item-label>
                  </q-item-section>
                  <q-item-section side @click="gotoSite(site.id)">
                    <q-btn color="secondary" size="12px" flat dense round icon="info" >
                      <q-tooltip>详情</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-item v-for="device in devices" :key="device.id">
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
            </q-infinite-scroll>
            <q-separator />
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { http } from '../../components/http'

export default {
  name: 'sites',
  data () {
    return {
      sites: [],
      devices: [],
      parentId: '',
      parents: [],
      siteFinished: false,
      sitePageNo: 0
    }
  },
  computed: {
  },
  created: function () {
    this.parentId = this.$route.params.parentId
    if (this.parentId === 'root') {
      this.parentId = ''
    }
    this.getParents()
  },
  activated: function () {
    if ((this.parentId !== this.$route.params.parentId && this.parentId !== '' && this.$route.params.parentId !== 'root') ||
      (this.parentId === '' && this.$route.params.parentId !== 'root') ||
      (this.parentId !== '' && this.$route.params.parentId === 'root') ||
      this.$route.query.fresh) {
      this.parents = []
      this.parentId = this.$route.params.parentId
      if (this.parentId === 'root') {
        this.parentId = ''
      }
      this.getParents()
      this.refreshList()
    }
  },
  watch: {
    parentId: function (val, oldVal) {
      this.$emit('change', val)
    }
  },
  methods: {
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
        http('get', siteUrl, '', (response) => {
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
      this.parentId = pId
      this.parents = []
      this.getParents()
      this.refreshList()
      if (pId === '') {
        this.$router.replace('/home/sites/root')
      } else {
        this.$router.replace('/home/sites/' + this.parentId)
      }
    },
    refresh (done) {
      this.refreshList()
      done()
    },
    refreshList () {
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
