<template>
  <q-page class="flex justify-center q-ma-md">
    <div style="width: 800px">
      <q-toolbar class="text-primary q-my-lg">
        <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
        <q-toolbar-title>
          告警详细信息
        </q-toolbar-title>

        <q-btn flat round dense icon="more_vert" >
          <q-menu>
            <q-list >
              <q-item clickable v-close-popup @click="gotoObject">
                <q-item-section avatar>
                  <q-icon color="primary" :name="getObjectIcon" />
                </q-item-section>
                <q-item-section>{{getObjectLabel}}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setSilent" >
                <q-item-section avatar>
                  <q-icon color="primary" :name="getSilentIcon" />
                </q-item-section>
                <q-item-section >
                  {{getSilentLabel}}
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setTop" >
                <q-item-section avatar>
                  <q-icon color="primary" :name="getTopIcon" />
                </q-item-section>
                <q-item-section :label="getTopLabel" >
                  {{getTopLabel}}
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="clearAlarm">
                <q-item-section avatar>
                  <q-icon color="primary" name="clear" />
                </q-item-section>
                <q-item-section>清空告警记录</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <!--<q-toolbar slot="header" color="white">-->
        <!--<q-select v-model="select" :options="selectOptions" style="margin-left: 5px; margin: 0" @change="setPlaceHolder"/>-->
        <!--<q-search :placeholder="placeholder" v-model="search" style="margin: 0" v-if="select === 'type' || select === 'information'"/>-->
        <!--<q-datetime-->
          <!--placeholder="搜索告警日期"-->
          <!--v-model="search"-->
          <!--style="margin: 0"-->
          <!--v-if="select === 'date'"-->
          <!--:before="[{icon: 'search'}]"-->
        <!--/>-->
      <!--</q-toolbar>-->

      <q-card class="q-ma-md">
        <q-card-section>
          <q-list separator>
            <q-item v-for="(alarm) in alarmDetails(notifyObjectId, select, search)" :key="alarm.id">
              <q-item-section avatar>
                <q-icon :color="getColor(alarm)" name="error" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>上报时间：{{alarm.reportTime}}</q-item-label>
                <q-item-label caption>接收时间：{{alarm.receiveTime}}</q-item-label>
                <AttributeValue :title="alarm.alarmType" :attributeValue="getAlarmInfo(alarm.alarmInfo)" @read="readAlarm(alarm.id)"/>
              </q-item-section>
              <q-item-section side top>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn class="gt-xs" size="12px" flat dense round icon="unarchive" color="secondary" @click="$store.commit('unread', alarm.id)" v-if="alarm.read">
                    <q-tooltip>标记未读</q-tooltip>
                  </q-btn>
                  <q-btn size="12px" flat dense round icon="delete" color="red" @click="deleteAlarm(alarm.id)">
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import { http } from '../../components/http'
import AttributeValue from '../../components/AttributeValue'

export default {
  components: {
    AttributeValue
  },
  data () {
    return {
      notifyObjectId: '',
      notifyObjectType: '',
      mode: 'normal',
      itemsSelect: [],
      placeholder: '搜索告警类型',
      select: 'type',
      search: '',
      selectOptions: [
        {
          label: '告警类型',
          value: 'type'
        },
        {
          label: '告警信息',
          value: 'information'
        },
        {
          label: '告警日期',
          value: 'date'
        }
      ]
    }
  },
  computed: {
    ...mapGetters({
      alarmDetails: 'getAlarmDetails',
      isSilent: 'isSilent',
      isTop: 'isTop'
    }),
    getTopLabel () {
      if (this.isTop(this.notifyObjectId)) {
        return '取消置顶'
      } else {
        return '告警置顶'
      }
    },
    getObjectIcon () {
      if (this.notifyObjectType === 'device') {
        return 'devices'
      } else {
        return 'location_city'
      }
    },
    getObjectLabel () {
      if (this.notifyObjectType === 'device') {
        return '设备信息'
      } else {
        return '场地信息'
      }
    },
    getTopIcon () {
      if (this.isTop(this.notifyObjectId)) {
        return 'exit_to_app'
      } else {
        return 'open_in_browser'
      }
    },
    getSilentLabel () {
      if (this.isSilent(this.notifyObjectId)) {
        return '取消静音'
      } else {
        return '告警静音'
      }
    },
    getSilentIcon () {
      if (this.isSilent(this.notifyObjectId)) {
        return 'alarm_on'
      } else {
        return 'alarm_off'
      }
    }
  },
  created: function () {
    this.notifyObjectId = this.$route.params.id
    this.notifyObjectType = this.$route.params.type
  },
  methods: {
    gotoObject () {
      var type
      if (this.notifyObjectType === 'device') {
        type = 'device'
      } else {
        type = 'site'
      }
      let url = '/home/sites/root/' + type + '/' + this.notifyObjectId
      this.$router.push({ path: url })
    },
    setPlaceHolder () {
      this.search = ''
      if (this.select === 'type') {
        this.placeholder = '搜索告警类型'
      }
      if (this.select === 'information') {
        this.placeholder = '搜索告警信息'
      }
    },
    getColor (alarm) {
      if (alarm.read) {
        return ''
      } else {
        return 'red'
      }
    },
    setSilent () {
      var data = {
        'notifyObjectId': this.notifyObjectId,
        'key': 'silent',
        'value': !this.isSilent(this.notifyObjectId)
      }
      http('patch', '/configurations', data, (response) => {
        this.$q.notify({
          message: this.getSilentLabel + '设置成功',
          color: 'positive'
        })
        if (!this.isSilent(this.notifyObjectId)) {
          this.$store.commit('addSilent', this.notifyObjectId)
        } else {
          this.$store.commit('removeSilent', this.notifyObjectId)
        }
      })
    },
    setTop () {
      var data = {
        'notifyObjectId': this.notifyObjectId,
        'key': 'top',
        'value': !this.isTop(this.notifyObjectId)
      }
      http('patch', '/configurations', data, (response) => {
        this.$q.notify({
          message: this.getTopLabel + '设置成功',
          color: 'positive'
        })
        if (!this.isTop(this.notifyObjectId)) {
          this.$store.commit('addTop', this.notifyObjectId)
        } else {
          this.$store.commit('removeTop', this.notifyObjectId)
        }
      })
    },
    deleteAlarm (alarmId) {
      this.$store.commit('delete', alarmId)
    },
    readAlarm (alarmId) {
      this.$store.commit('read', alarmId)
    },
    clearAlarm () {
      this.$q.dialog({
        title: '删除所有告警',
        message: '确定删除该设备所有的告警记录么？',
        ok: {
          label: '清空',
          color: 'red'
        }
      }).onOk((data) => {
        this.$store.commit('clear', this.notifyObjectId)
        this.$router.push('/home/alarms')
      })
    },
    getAlarmInfo (alarmInfo) {
      if (alarmInfo !== null) {
        return { '告警详细信息': alarmInfo }
      } else {
        return null
      }
    }
  }
}
</script>

<style>
</style>
