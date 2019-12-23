<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="devices" />
          <q-toolbar-title>
            设备类型
          </q-toolbar-title>
          <q-btn flat round dense icon="refresh" @click="refreshList">
            <q-tooltip>刷新</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="more_vert">
            <q-menu>
              <q-list >
                <q-item clickable v-close-popup @click="add">
                  <q-item-section avatar>
                    <q-icon color="primary" name="devices" />
                  </q-item-section>
                  <q-item-section>添加设备类型</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
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
                  <q-item-section side >
                    <div class="text-grey-8 q-gutter-xs">
                    <q-btn color="secondary" size="12px" flat dense round icon="info" @click="goto(deviceType.id)">
                      <q-tooltip>详情</q-tooltip>
                    </q-btn>
                    <q-btn size="12px" flat dense round icon="edit" color="secondary" @click="rename(deviceType)">
                      <q-tooltip>重命名</q-tooltip>
                    </q-btn>
                    <q-btn size="12px" flat dense round icon="delete" color="red" @click="del(deviceType.id)">
                      <q-tooltip>删除</q-tooltip>
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
    add () {
      let url = '/home/devicetypes/adddevicetype'
      this.$router.push({ path: url })
    },
    rename (deviceType) {
      this.$q.dialog({
        title: '重命名',
        message: '请输入设备组名称',
        prompt: {
          type: 'text',
          model: deviceType.name
        },
        ok: {
          label: '确定'
        }
      }).onOk((data) => {
        let editUrl = '/devicetypes/name'
        let info = {
          'id': deviceType.id,
          'name': data
        }
        http('patch', editUrl, info, (response) => {
          this.refreshList()
        })
      })
    },
    del (id) {
      this.$q.dialog({
        title: '删除设备类型',
        message: '确定删除该设备类型么？',
        ok: {
          label: '删除',
          color: 'red'
        },
        cancel: {
          label: '取消'
        },
        persistent: true
      }).onOk((data) => {
        let delUrl = '/devicetypes/' + id
        http('delete', delUrl, '', (response) => {
          this.refreshList()
        })
      })
    },
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
