<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
          <q-toolbar-title>
            设备属性：{{attribute}}
          </q-toolbar-title>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-infinite-scroll @load="loadMore" ref="scroll">
              <q-list separator>
                <q-item v-for="item in items" :key="item.id">
                  <q-item-section avatar>
                    <q-icon color="primary" name="events" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>上报时间：{{item.reportTime}}</q-item-label>
                    <q-item-label caption>接收时间：{{item.receiveTime}}</q-item-label>
                    <DataValue :dataValue="item.value" />
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
import DataValue from '../../components/DataValue.vue'
import { http } from '../../components/http'

export default {
  name: 'events',
  components: {
    DataValue
  },
  data () {
    return {
      items: [],
      deviceId: '',
      attribute: ''
    }
  },
  created () {
    this.deviceId = this.$route.params.id
    this.attribute = this.$route.params.attribute
  },
  methods: {
    refresh (done) {
      done()
      this.items = []
      this.$refs.scroll.reset()
      this.$refs.scroll.resume()
      this.$refs.scroll.trigger()
    },
    loadMore (pageNo, done) {
      pageNo--
      let page = {
        params: {
          deviceId: this.deviceId,
          attribute: this.attribute,
          currentPage: pageNo
        }
      }
      let url = 'events'
      http('get', url, page, (response) => {
        this.items.push(...response.data.content)

        if (response.data.last) {
          this.$refs.scroll.stop()
        }
        done()
      })
    }
  }
}
</script>

<style>
</style>
