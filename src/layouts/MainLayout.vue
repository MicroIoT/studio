<template>
  <q-layout view="hHh LpR lFr">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-btn flat no-caps no-wrap class="q-ml-xs" v-if="$q.screen.gt.xs">
          <img src="statics/icons/favicon-32x32.png" size="28px" />
          <q-toolbar-title>
            MicroIoT Studio
          </q-toolbar-title>
        </q-btn>
        <q-space />
        <div class="q-pl-sm q-gutter-sm row items-center no-wrap">
          <div>当前领域：</div>
          <q-select :options="domains" v-model="domain" dense outlined style="width: 250px;">
          </q-select>
          <q-btn round flat icon="person">
            <q-menu>
              <q-list separator>
                <q-item clickable v-close-popup :to="gotoUser">
                  <q-item-section avatar>
                    <q-icon color="primary" name="person" />
                  </q-item-section>
                  <q-item-section>{{$store.getters.getCurrentUser.username}}</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="exit">
                  <q-item-section avatar>
                    <q-icon color="red" name="exit_to_app" />
                  </q-item-section>
                  <q-item-section>退出系统</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
      :width="180"
    >
      <q-scroll-area class="fit">
        <q-list padding >
          <q-item clickable v-ripple to="/home" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label>首页</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator spaced inset/>
          <q-item clickable v-ripple :to="getTo">
            <q-item-section avatar>
              <q-icon name="view_day"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>设备</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/home/alarms">
            <q-item-section avatar>
              <q-icon name="error" >
              </q-icon>
            </q-item-section>
            <q-item-section>
              <div>
                告警
                <q-badge color="red" align="top" v-if="alarmTotal > 0">
                  {{alarmTotal}}
                </q-badge>
              </div>
            </q-item-section>
          </q-item>
          <q-separator spaced inset/>
          <q-item-label header class="text-weight-bold">
            系统配置
          </q-item-label>
          <q-item clickable v-ripple to="/home/sitetypes">
            <q-item-section avatar>
              <q-icon name="location_city"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>场地类型</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/home/devicetypes">
            <q-item-section avatar>
              <q-icon name="devices"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>设备类型</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/home/devicegroups">
            <q-item-section avatar>
              <q-icon name="group_work"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>设备组</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator spaced inset/>
          <q-item clickable v-ripple to="/home/domains">
            <q-item-section avatar>
              <q-icon name="folder_open"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>领域</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple v-if="$store.getters.getCurrentUser.isSystem" to="/home/users">
            <q-item-section avatar>
              <q-icon name="people"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>用户</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple v-if="$store.getters.getCurrentUser.isSystem" to="/home/sessions">
            <q-item-section avatar>
              <q-icon name="people_outline"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>会话</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/home/favorites" replace>
            <q-item-section avatar>
              <q-icon name="star_border"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>收藏</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <keep-alive include="sites">
        <router-view v-on:change="change" v-on:update="updateDomain" ref="refPage"/>
      </keep-alive>
    </q-page-container>
  </q-layout>
</template>

<script>
import { http } from '../components/http'
import { initSystem } from '../components/util'
import { mapGetters } from 'vuex'
import { stomp } from '../components/stomp'

export default {
  name: 'main-layout',

  data () {
    return {
      leftDrawerOpen: false,
      parentId: '',
      domains: []
    }
  },
  beforeCreate () {
    window.addEventListener('load', (event) => {
      initSystem()
    })
  },
  computed: {
    ...mapGetters({
      alarmTotal: 'getAlarmTotal'
    }),
    domain: {
      get: function () {
        if (this.$store.getters.getDomain !== null) {
          return this.$store.getters.getDomain.name
        } else {
          return ''
        }
      },
      set: function (value) {
        this.chooseDomain(value)
      }
    },
    getTo () {
      if (this.parentId !== '') {
        return '/home/sites/' + this.parentId
      } else {
        return '/home/sites/root'
      }
    },
    gotoUser () {
      return '/home/users/user/' + this.$store.getters.getCurrentUser.username
    }
  },
  created: function () {
    this.getDomains()
  },
  methods: {
    getDomains () {
      this.domains = []
      http('get', '/domains/me', null, (response) => {
        for (var key in response.data) {
          this.domains.push(response.data[key].name)
        }
      })
    },
    chooseDomain (domain) {
      http('patch', '/domains/' + domain, null, (response) => {
        this.$store.commit('token', response.data)
        http('get', '/domains/name/' + domain, '', (response) => {
          this.$store.commit('domain', response.data)
          window.location.reload()
        })
      })
    },
    updateDomain (val) {
      this.getDomains()
    },
    change (val) {
      this.parentId = val
      // this.$refs.sites.select()
    },
    exit () {
      stomp.disconnect()
      this.$store.commit('logout')
      this.$store.commit('quit')
      this.$router.push('/')
    }
  }
}
</script>
