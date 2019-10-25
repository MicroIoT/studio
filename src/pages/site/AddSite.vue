<template>
  <q-page class="flex justify-center q-ma-md">
      <q-dialog v-model="showDialog" persistent>
        <q-card style="width: 1000px; max-width: 80vw;">
          <q-toolbar class="text-primary">
            <q-toolbar-title>
              添加场地
            </q-toolbar-title>
            <q-space />
            <q-btn icon="close" flat round dense @click="$router.back()" />
          </q-toolbar>
          <q-stepper
            v-model="step"
            vertical
            color="primary"
            animated
          >
            <q-step
              :name="1"
              title="场地基本信息"
              :done="step > 1"
            >
              <q-field label="父场地" dense>
                <q-input class="self-center full-width no-outline" readonly v-model="parentName"/>
              </q-field>
              <q-field label="场地名称" dense
                       hint=""
                       :error="$v.site.name.$error"
                       error-message="场地名称不能为空">
                <q-input class="self-center full-width no-outline" v-model="site.name" autofocus/>
              </q-field>
              <q-field label="场地类型" dense
                       hint=""
                       :error="$v.site.sitetype.$error"
                       error-message="场地类型不能为空">
                <q-select class="self-center full-width no-outline" v-model="site.sitetype" :options="sitetypes" @input="typeChanged()"/>
              </q-field>

              <q-stepper-navigation>
                <q-btn @click="initSite" color="primary" label="继续" />
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="2"
              title="场地属性值"
              :done="step > 2"
            >
              <q-stepper
                ref="stepper"
                v-model="attStep"
                vertical
                color="primary"
                animated
                v-if="getSelectedSiteType() !== null "
              >
                <q-step
                  v-for="(value, key, index) in getSelectedSiteType()"
                  :name="index"
                  :title="key"
                  :caption="value.description"
                  icon="edit"
                  :key="key"
                  :error="value.error"
                >
                  <AttributeInput :attDefinition="getDefinition(key, value)" :ref="key"/>
                  <q-stepper-navigation>
                    <q-btn color="primary" label="继续"  v-if="showDownward(index)" @click="clickCheck(key, value, index, true)"/>
                    <q-btn color="primary" label="回退" class="q-ml-sm" v-if="showUpward(index)" @click="clickCheck(key, value, index, false)"/>
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>

              <q-stepper-navigation>
                <div class="row">
                  <q-btn @click="step = 1" color="primary" label="回退" class="q-ml-sm" />
                  <q-space />
                  <q-btn @click="finish" color="primary" label="提交" v-show="showFinish"/>
                </div>
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card>
      </q-dialog>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { http } from '../../components/http'
import AttributeInput from '../../components/AttributeInput.vue'
import store from '../../store'

export default {
  components: {
    AttributeInput
  },
  name: 'addsite',
  data () {
    return {
      showDialog: false,
      step: 1,
      attStep: 0,
      parentId: '',
      parentName: '',
      parent: '',
      sitetypeDefs: [],
      sitetypes: [],
      showFinish: false,
      site: {
        name: '',
        sitetype: '',
        attributes: {}
      }
    }
  },
  validations: {
    site: {
      name: { required },
      sitetype: { required }
    }
  },
  created: function () {
    this.parentId = this.$route.params.parentId
    this.getParent()
    this.getSiteTypes()
    this.showDialog = true
  },
  beforeRouteLeave: (to, from, next) => {
    store.commit('close')
    next()
  },
  methods: {
    typeChanged () {
      this.site.attributes = {}
      this.attStep = 0
      this.showFinish = false
    },
    finish () {
      if (this.getSelectedSiteType() != null && Object.keys(this.getSelectedSiteType()).length > 0) {
        let k = Object.keys(this.getSelectedSiteType()).length - 1
        let key = Object.keys(this.getSelectedSiteType())[k]
        if (this.$refs[key][0].canSubmit()) {
          let v = this.$refs[key][0].getInputValue()
          let k = Object.keys(v)[0]
          let val = v[k]
          this.site.attributes[key] = val
        }
      }

      var data = {
        'name': this.site.name,
        'siteType': this.site.sitetype,
        'locationId': this.parentId === 'root' ? this.$store.getters.getDomain.id : this.parentId,
        'attInfos': this.site.attributes
      }
      http('post', '/sites', data, (response) => {
        this.$q.dialog({
          title: '添加场地',
          message: '场地: ' + response.data.string + ' 添加成功!',
          ok: {
            label: '确定'
          }
        }).onOk((data) => {
          if (this.parentId !== 'root') {
            this.$router.replace({ path: '/home/sites/' + this.parentId, query: { fresh: true } })
          } else {
            this.$router.replace({ path: '/home/sites/root', query: { fresh: true } })
          }
        })
      })
    },
    clickCheck (key, value, index, next) {
      if (this.$refs[key][0].canSubmit()) {
        if (!value.error) {
          let v = this.$refs[key][0].getInputValue()
          let k = Object.keys(v)[0]
          let val = v[k]
          this.site.attributes[key] = val
          if (next) {
            if (index === (Object.keys(this.getSelectedSiteType()).length - 2)) {
              this.showFinish = true
            }
            this.$refs.stepper.next()
          } else {
            this.$refs.stepper.previous()
            this.showFinish = false
          }
        }
      }
    },
    showDownward (index) {
      return index !== (Object.keys(this.getSelectedSiteType()).length - 1)
    },
    showUpward (index) {
      return index !== 0
    },
    getDefinition (key, value) {
      let definition = {}
      definition[key] = value
      return definition
    },
    getSelectedSiteType () {
      for (var i = 0; i < this.sitetypeDefs.length; i++) {
        if (this.sitetypeDefs[i].name === this.site.sitetype) {
          return this.sitetypeDefs[i].attDefinition
        }
      }
    },
    initSite () {
      this.$v.site.$touch()
      if (this.$v.site.$error) {
        return
      }
      this.step = 2
      this.showFinish = true
    },
    getSiteTypes () {
      http('get', '/sitetypes/list', null, (response) => {
        this.sitetypeDefs = response.data
        for (var key in this.sitetypeDefs) {
          this.sitetypes.push(this.sitetypeDefs[key].name)
        }
      })
    },
    getParent () {
      if (this.parentId !== 'root') {
        let url = '/sites/' + this.parentId
        http('get', url, '', (response) => {
          this.parent = response.data
          this.parentName = this.parent.string
        })
      } else {
        this.parentName = this.$store.getters.getDomain.name
      }
    }
  }
}
</script>

<style>
</style>
