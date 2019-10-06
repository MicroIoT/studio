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
          <q-toolbar-title shrink class="text-weight-bold">
            MicroIoT Client
          </q-toolbar-title>
        </q-btn>
        <q-space />
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn round dense flat icon="notifications">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn round flat icon="account_box">
            <q-tooltip>Account</q-tooltip>
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
          <q-item clickable v-ripple >
            <q-item-section avatar>
              <q-icon name="error" />
            </q-item-section>
            <q-item-section>
              <q-item-label>告警</q-item-label>
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
          <q-item clickable v-ripple v-if="$store.getters.getCurrentUser.isSystem" to="/home/devicegroups">
            <q-item-section avatar>
              <q-icon name="group_work"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>设备组</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator spaced inset/>
          <q-item clickable v-ripple v-if="$store.getters.getCurrentUser.isSystem" to="/home/users">
            <q-item-section avatar>
              <q-icon name="people"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>用户</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/home/favorites" replace>
            <q-item-section avatar>
              <q-icon name="favorite"/>
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
        <router-view v-on:change="change"/>
      </keep-alive>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MyLayout',

  data () {
    return {
      leftDrawerOpen: false,
      parentId: ''
    }
  },
  computed: {
    getTo () {
      console.log('get to: ' + this.parentId)
      if (this.parentId !== '') {
        return '/home/site/' + this.parentId
      } else {
        return '/home/site/root'
      }
    }
  },
  methods: {
    change (val) {
      this.parentId = val
      // this.$refs.sites.select()
    }
  }
}
</script>
<style lang="sass">
  .my-menu-link
    color: white
    background: #F2C037
</style>
