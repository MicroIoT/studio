<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 600px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
          <q-toolbar-title>
            场地详细信息
          </q-toolbar-title>
          <q-btn flat round dense icon="more_vert" >
            <q-menu>
              <q-list >
                <Favorite :name="site.string" type="Site" :id="siteId"></Favorite>
                <Subscribe :name="site.string" type="Site" :id="siteId" v-if="mysite"></Subscribe>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item >
                <q-item-section avatar>
                  <q-icon :color="alarmAmount(siteId) > 0  && mysite?'red':'primary'" name="location_city" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{site.string}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card >
              <q-field stack-label class="q-ma-md" label="场地类型">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control  @click="gotoSiteType(site.siteType.id)">
                  <div class="self-center full-width no-outline" tabindex="0">{{site.siteType?site.siteType.name:''}}</div>
                </template>
                <template v-slot:append>
                  <q-btn color="secondary" size="12px" flat dense round icon="info" @click="gotoSiteType(site.siteType.id)">
                  </q-btn>
                </template>
              </q-field>
              <AttributeValue title="场地属性"  :attributeValue="site.attributes" v-if="site.attributes && Object.keys(site.attributes).length > 0" class="text-primary"/>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { http } from '../../components/http'
import AttributeValue from '../../components/AttributeValue'
import Favorite from '../../components/Favorite'
import Subscribe from '../../components/Subscribe'
import { mapGetters } from 'vuex'

export default {
  components: {
    AttributeValue, Favorite, Subscribe
  },
  name: 'site',
  data () {
    return {
      mysite: false,
      siteId: '',
      site: {
        attributes: {}
      }
    }
  },
  computed: {
    ...mapGetters({
      alarmAmount: 'getNotifyObjectAlarmTotal'
    })
  },
  created: function () {
    this.siteId = this.$route.params.id

    this.getSite()
    this.isMySite()
  },
  methods: {
    gotoSiteType (sitetypeId) {
      var page = {
        name: 'sitetype',
        params: { id: sitetypeId }
      }
      this.$router.push(page)
    },
    isMySite () {
      if (this.$store.getters.getCurrentUser.isArea) {
        let url = '/sites/me/'
        http('get', url + this.siteId, '', (response) => {
          this.mysite = response.data
        })
      } else {
        this.mysite = true
      }
    },
    refresh (done) {
      done()
      this.getSite()
      this.isMySite()
    },
    getSite () {
      let url = '/sites/' + this.siteId
      http('get', url, '', (response) => {
        this.site = response.data
      })
    }
  }
}
</script>

<style>
</style>
