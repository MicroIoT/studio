<template>
  <q-page class="flex justify-center q-ma-md">
    <q-dialog v-model="showDialog" persistent>
        <q-card style="width: 800px; max-width: 80vw;">
          <q-toolbar class="text-primary">
            <q-toolbar-title>
              添加场地类型
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
              title="场地类型基本信息"
              :done="step > 1"
            >
              <q-field label="场地类型名称" dense
                       hint=""
                       :error="$v.sitetype.name.$error"
                       error-message="场地类型名称不能为空">
                <q-input class="self-center full-width no-outline" v-model="sitetype.name" autofocus/>
              </q-field>
              <q-field label="场地类型描述" dense
                       hint="">
                <q-input class="self-center full-width no-outline" v-model="sitetype.description"/>
              </q-field>

              <q-stepper-navigation>
                <q-btn @click="initSiteType" color="primary" label="继续" />
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="2"
              title="场地类型属性信息"
              :done="step > 2"
            >
              <attribute-definition-input :attributes="sitetype.attributes" ref="attribute"></attribute-definition-input>
              <q-stepper-navigation>
                <div class="row">
                  <q-btn @click="addAttribute" color="primary" label="添加" class="q-ml-sm" />
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
import AttributeDefinitionInput from '../../components/AttributeDefinitionInput.vue'

export default {
  components: {
    AttributeDefinitionInput
  },
  name: 'addsitetype',
  data () {
    return {
      showDialog: false,
      step: 1,
      showFinish: false,
      sitetype: {
        name: '',
        description: '',
        attributes: []
      }
    }
  },
  validations: {
    sitetype: {
      name: { required }
    }
  },
  created: function () {
    this.showDialog = true
  },
  methods: {
    finish () {
      if (this.$refs.attribute.canSubmit()) {
        let attributes = this.$refs.attribute.getAttributes()
        let data = {
          name: this.sitetype.name,
          description: this.sitetype.description,
          optional: false,
          dataType: 'Class',
          additional: attributes
        }
        http('post', '/sitetypes', data, (response) => {
          this.$q.dialog({
            title: '添加场地类型',
            message: '场地类型: ' + this.sitetype.name + ' 添加成功!',
            ok: {
              label: '确定'
            },
            persistent: true
          }).onOk((data) => {
            this.$router.replace({ path: '/home/sitetypes' })
          })
        })
      }
    },
    addAttribute () {
      this.sitetype.attributes.push({})
    },
    initSiteType () {
      this.$v.sitetype.$touch()
      if (this.$v.sitetype.$error) {
        return
      }
      this.step = 2
      this.showFinish = true
    }
  }
}
</script>

<style>
</style>
