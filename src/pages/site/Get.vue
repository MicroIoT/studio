<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
          <q-toolbar-title>
            读取设备属性
          </q-toolbar-title>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label caption>属性</q-item-label>
                  <q-item-label >{{attribute}}</q-item-label>
                </q-item-section>
                <q-item-section side><q-btn color="primary" @click="refresh">读取</q-btn></q-item-section>
              </q-item>
            </q-list>
            <q-card class="q-my-md">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>属性值</q-item-label>
                    <DataValue :dataValue="value.value" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import DataValue from '../../components/DataValue.vue'
import { stomp } from '../../components/stomp'

export default {
  name: 'get',
  components: {
    DataValue
  },
  data () {
    return {
      value: {},
      deviceId: '',
      attribute: ''
    }
  },
  created () {
    this.deviceId = this.$route.params.id
    this.attribute = this.$route.params.attribute
    this.refresh()
  },
  methods: {
    refresh () {
      stomp.operate(this.deviceId, 'get', this.attribute, null, (result) => {
        this.value = result
        this.$q.dialog({
          title: '读取成功',
          ok: {
            label: '确定'
          }
        })
      })
    }
  }
}
</script>

<style>
</style>
