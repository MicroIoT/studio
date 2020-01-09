<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
          <q-toolbar-title>
            会话详细信息
          </q-toolbar-title>
          <q-btn flat round dense icon="refresh" @click="getSession()">
            <q-tooltip>刷新</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item >
                <q-item-section avatar>
                  <q-icon color="primary" :name="getIcon()" />
                </q-item-section>
                <q-item-section  @click="goto()" class="cursor-pointer">
                  <q-item-label >{{session.username}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card class="q-pb-xs">
              <q-field stack-label class="q-ma-md" label="登录IP地址">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control >
                  <div class="self-center full-width no-outline" tabindex="0">{{session.ip}}</div>
                </template>
              </q-field>
              <q-field stack-label class="q-ma-md" label="登录时间">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control >
                  <div class="self-center full-width no-outline" tabindex="0">{{session.loginTime}}</div>
                </template>
              </q-field>
              <q-field stack-label class="q-ma-md" label="过期时间">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control >
                  <div class="self-center full-width no-outline" tabindex="0">{{session.expire}}</div>
                </template>
              </q-field>
              <q-field stack-label class="q-ma-md" label="刷新过期时间">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control >
                  <div class="self-center full-width no-outline" tabindex="0">{{session.refreshExpire}}</div>
                </template>
              </q-field>
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
  name: 'session',
  data () {
    return {
      id: '',
      session: ''
    }
  },
  created: function () {
    this.id = this.$route.params.id
    this.getSession()
  },
  methods: {
    goto () {
      var page
      var device
      if (this.session.device) {
        let url = '/devices/username/' + this.session.username
        http('get', url, '', (response) => {
          device = response.data
          page = {
            name: 'device',
            params: { id: device.id }
          }
          this.$router.push(page)
        })
      } else {
        page = {
          name: 'user',
          params: { username: this.session.username }
        }
        this.$router.push(page)
      }
    },
    getIcon () {
      if (this.session.device) {
        return 'devices'
      } else {
        return 'person'
      }
    },
    refresh (done) {
      done()
      this.getSession()
    },
    getSession () {
      let url = '/sessions/' + this.id
      http('get', url, '', (response) => {
        this.session = response.data
      })
    }
  }
}
</script>

<style>
</style>
