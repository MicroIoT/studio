<template>
    <q-item clickable v-close-popup @click="alarm" v-if="!subscribed">
      <q-item-section avatar>
        <q-icon color="primary" name="error" />
      </q-item-section>
      <q-item-section>订阅告警</q-item-section>
    </q-item>
  <q-item clickable v-close-popup @click="alarm" v-else>
    <q-item-section avatar>
      <q-icon name="error" />
    </q-item-section>
    <q-item-section>取消订阅</q-item-section>
  </q-item>
</template>

<script>
import { http } from './http'
import { stomp } from './stomp'

export default {
  name: 'Subscribe',
  props: ['type', 'name', 'id'],
  computed: {
    getName: function () {
      return this.name
    },
    getId: function () {
      return this.id
    }
  },
  data () {
    return {
      subscribed: false
    }
  },
  created: function () {
    this.subscribe()
  },
  methods: {
    alarm () {
      if (!this.subscribed) {
        var data = {
          'key': 'subscribe',
          'value': true,
          'notifyObjectId': this.getId
        }
        http('patch', '/configurations', data, (response) => {
          this.$q.notify({
            message: '已订阅告警',
            color: 'positive'
          })
          stomp.subscribe(this.getId)
          this.subscribed = true
        })
      } else {
        var info = {
          'key': 'subscribe',
          'value': false,
          'notifyObjectId': this.getId
        }
        http('patch', '/configurations', info, (response) => {
          this.$q.notify({
            message: '取消订阅告警',
            color: 'positive'
          })
          stomp.unsubscribe(this.getId)
          this.subscribed = false
        })
      }
    },
    subscribe () {
      let existUrl = '/configurations/' + this.getId
      http('get', existUrl, '', (response) => {
        if (response.data) {
          this.subscribed = response.data.subscribe
        }
      })
    }
  }
}
</script>

<style>
</style>
