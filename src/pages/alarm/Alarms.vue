<template>
  <q-page class="flex justify-center q-ma-md ">
    <div style="width: 800px">
      <q-toolbar class="text-primary q-my-lg">
        <q-btn flat round dense icon="error" />
        <q-toolbar-title>
          告警
        </q-toolbar-title>
      </q-toolbar>
      <q-card class="q-ma-md">
        <q-card-section>
          <q-list highlight separator>
            <q-item v-for="alarm in $store.getters.getAlarms" :key="alarm.notifyObjectId" >
              <q-item-section avatar >
                <q-icon :color="getColor(alarm.amount)" name="error" />
              </q-item-section>
              <q-item-section @click="goto(alarm.notifyObjectId, alarm.notifyObjectType)"  class="cursor-pointer">
                <q-item-label>{{alarm.notifyObjectName}}</q-item-label>
                <q-item-label caption>{{getAmount(alarm.amount)}} {{alarm.alarmType}}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{formatTime(alarm.time, true)}}</q-item-label>
                <span class="text-faded">
                  <q-icon name="notifications_off" v-if="alarm.silent"/>
                  <q-icon name="vertical_align_top" v-if="alarm.top"/>
                </span>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { formatDate } from '../../components/util'

export default {
  name: 'alarms',
  data () {
    return {}
  },
  methods: {
    getColor (amount) {
      if (amount > 0) {
        return 'red'
      } else {
        return ''
      }
    },
    getAmount (amount) {
      if (amount > 0) {
        return '[' + amount + '条]'
      } else {
        return ''
      }
    },
    formatTime (time, simple) {
      return formatDate(time, simple)
    },
    goto (notifyObjectId, notifyObjectType) {
      var page = {
        name: 'alarm',
        params: { id: notifyObjectId, type: notifyObjectType }
      }
      this.$router.push(page)
    }
  }
}
</script>

<style>
</style>
