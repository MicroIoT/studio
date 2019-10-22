<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="folder_open" />
          <q-toolbar-title>
            领域
          </q-toolbar-title>
          <q-btn flat round dense icon="more_vert">
            <q-menu>
              <q-list >
                <q-item clickable v-close-popup @click="add">
                  <q-item-section avatar>
                    <q-icon color="primary" name="work" />
                  </q-item-section>
                  <q-item-section>添加</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-infinite-scroll @load="loadMore" ref="scroll" >
              <q-list highlight separator>
                <q-item v-for="domain in domains" :key="domain.id">
                  <q-item-section avatar v-if="$q.screen.gt.xs">
                    <q-icon color="primary" name="work" />
                  </q-item-section>
                  <q-item-section >
                    <q-item-label >{{domain.name}}</q-item-label>
                  </q-item-section>
                  <q-item-section side >
                    <q-btn color="red" size="12px" flat dense round icon="delete" @click="del(domain.id)">
                      <q-tooltip>删除</q-tooltip>
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
  name: 'domains',
  data () {
    return {
      domains: []
    }
  },
  computed: {
  },
  methods: {
    add () {
      this.$q.dialog({
        title: '添加',
        message: '请输入领域名称',
        prompt: {
          type: 'text',
          model: name
        },
        ok: {
          label: '确定'
        }
      }).onOk((data) => {
        let url = '/domains'
        let info = {
          'name': data
        }
        http('post', url, info, (response) => {
          this.refreshList()
          this.$emit('update', data)
        })
      })
    },
    del (id) {
      this.$q.dialog({
        title: '删除领域',
        message: '领域内所有配置信息都将被删除，确定删除该领域么？',
        ok: {
          label: '删除',
          color: 'red'
        },
        cancel: {
          label: '取消'
        },
        persistent: true
      }).onOk((data) => {
        let delUrl = '/domains/' + id
        http('delete', delUrl, '', (response) => {
          this.refreshList()
          this.$emit('update', null)
        })
      })
    },
    refresh (done) {
      this.refreshList()
      done()
    },
    refreshList () {
      this.domains = []
      this.$refs.scroll.reset()
      this.$refs.scroll.resume()
      this.$refs.scroll.trigger()
    },
    loadMore (pageNo, done) {
      http('get', '/domains/me', null, (response) => {
        done()
        this.domains = response.data
        this.$refs.scroll.stop()
      })
    }
  }
}
</script>

<style>
</style>
