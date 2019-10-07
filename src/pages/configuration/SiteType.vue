<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="location_city" />
          <q-toolbar-title>
            场地类型详细信息
          </q-toolbar-title>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item >
                <q-item-section avatar>
                  <q-icon color="primary" name="my_location" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{sitetype.name}}</q-item-label>
                  <q-item-label caption>{{sitetype.description}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        <q-card class="q-ma-md">
          <AttributeDefinition title="场地属性" :attributeDefinition="sitetype.attDefinition"/>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { http } from '../../components/http'
import AttributeDefinition from '../../components/AttributeDefinition'

export default {
  components: {
    AttributeDefinition
  },
  name: 'sitetype',
  data () {
    return {
      sitetypeId: '',
      sitetype: {
        attDefinition: {}
      }
    }
  },
  created () {
    this.sitetypeId = this.$route.params.id
    this.getSitetype()
  },
  methods: {
    getSitetype () {
      let sitetypeUrl = '/sitetypes/' + this.sitetypeId
      http('get', sitetypeUrl, '', (response) => {
        this.sitetype = response.data
      })
    },
    refresh (done) {
      done()
      this.getSitetype()
    }
  }
}
</script>

<style>
</style>
