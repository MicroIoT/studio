<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="people" />
          <q-toolbar-title>
            用户
          </q-toolbar-title>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-infinite-scroll @load="loadMore" ref="scroll" >
              <q-list highlight separator>
                <q-item v-for="user in users" :key="user.id">
                  <q-item-section avatar v-if="$q.screen.gt.xs">
                    <q-icon color="primary" :name="user.isSystem?'person':'streetview'" />
                  </q-item-section>
                  <q-item-section @click="goto(user.username)">
                    <q-item-label >{{user.username}}</q-item-label>
                    <q-item-label caption>{{user.email}}</q-item-label>
                  </q-item-section>
                  <q-item-section side @click="goto(user.username)">
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
  name: 'users',
  data () {
    return {
      users: []
    }
  },
  computed: {
  },
  methods: {
    goto (username) {
      var page = {
        name: 'user',
        params: { username: username }
      }
      this.$router.push(page)
    },
    refresh (done) {
      this.refreshList()
      done()
    },
    refreshList () {
      this.users = []
      this.$refs.scroll.reset()
      this.$refs.scroll.resume()
      this.$refs.scroll.trigger()
    },
    loadMore (pageNo, done) {
      pageNo--
      let pid = { params: { currentPage: pageNo } }

      http('get', '/users', pid, (response) => {
        done()
        if (response.data.totalElements > 0) {
          this.users.push(...response.data.content)
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
