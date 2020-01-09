<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="people_outline" />
          <q-toolbar-title>
            会话
          </q-toolbar-title>
          <q-btn flat round dense icon="refresh" @click="refreshList">
            <q-tooltip>刷新</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-infinite-scroll @load="loadMore" ref="scroll" >
              <q-list highlight separator>
                <q-item v-for="session in sessions" :key="session.id">
                  <q-item-section avatar v-if="$q.screen.gt.xs">
                    <q-icon color="primary" :name="session.device?'devices':'person'" />
                  </q-item-section>
                  <q-item-section @click="goto(session.id)" class="cursor-pointer">
                    <q-item-label >{{session.username}}</q-item-label>
                    <q-item-label caption>{{session.ip}}</q-item-label>
                  </q-item-section>
                  <q-item-section side >
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn color="secondary" size="12px" flat dense round icon="info" @click="goto(session.id)">
                        <q-tooltip>详情</q-tooltip>
                      </q-btn>
                      <q-btn size="12px" flat dense round icon="delete" color="red" @click="delSession(session.id, session.token)">
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
  name: 'sessions',
  data () {
    return {
      sessions: []
    }
  },
  computed: {
  },
  methods: {
    goto (id) {
      var page = {
        name: 'session',
        params: { id: id }
      }
      this.$router.push(page)
    },
    delSession (id, token) {
      if (token !== this.$store.getters.getToken.token) {
        this.$q.dialog({
          title: '删除会话',
          message: '删除会话后用户需要重新登录，确定删除该会话么？',
          ok: {
            label: '删除',
            color: 'red'
          },
          cancel: {
            label: '取消'
          },
          persistent: true
        }).onOk((data) => {
          let delUrl = '/sessions/' + id
          http('delete', delUrl, '', (response) => {
            this.refreshList()
          })
        })
      } else {
        this.$q.dialog({
          title: '删除会话',
          message: '不能删除会话本身？',
          ok: {
            label: '确认'
          },
          persistent: true
        }).onOk((data) => {
        })
      }
    },
    refresh (done) {
      this.refreshList()
      done()
    },
    refreshList () {
      this.sessions = []
      this.$refs.scroll.reset()
      this.$refs.scroll.resume()
      this.$refs.scroll.trigger()
    },
    loadMore (pageNo, done) {
      pageNo--
      let pid = { params: { currentPage: pageNo, isExpire: false } }

      http('get', '/sessions', pid, (response) => {
        done()
        if (response.data.totalElements > 0) {
          this.sessions.push(...response.data.content)
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
