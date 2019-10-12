<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="devices" />
          <q-toolbar-title>
            设备类型
          </q-toolbar-title>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-infinite-scroll @load="loadMore" ref="scroll" >
              <q-list highlight separator>
                <q-item v-for="deviceType in deviceTypes" :key="deviceType.id">
                  <q-item-section avatar v-if="$q.screen.gt.xs">
                    <q-icon color="primary" name="devices" />
                  </q-item-section>
                  <q-item-section @click="goto(deviceType.id)" class="cursor-pointer">
                    <q-item-label >{{deviceType.name}}</q-item-label>
                  </q-item-section>
                  <q-item-section side @click="goto(deviceType.id)">
                    <q-btn color="secondary" size="12px" flat dense round icon="info" >
                      <q-tooltip>详情</q-tooltip>
                    </q-btn>
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

export default {
  name: 'device-types',
  data () {
    return {
      deviceTypes: []
    }
  },
  computed: {
  },
  methods: {
    goto (id) {
      var page = {
        name: 'devicetype',
        params: { id: id }
      }
      this.$router.push(page)
    },
    refresh (done) {
      this.refreshList()
      done()
    },
    refreshList () {
      this.deviceTypes = []
      this.$refs.scroll.reset()
      this.$refs.scroll.resume()
      this.$refs.scroll.trigger()
    },
    loadMore (pageNo, done) {
      pageNo--
      let pid = { params: { currentPage: pageNo } }

      http('get', '/devicetypes/page', pid, (response) => {
        done()
        if (response.data.totalElements > 0) {
          this.deviceTypes.push(...response.data.content)
          if (response.data.last) {
            this.$refs.scroll.stop()
          }
        } else {
          this.$refs.scroll.stop()
        }
      })
    }
  }
}
</script>

<style>
</style>
