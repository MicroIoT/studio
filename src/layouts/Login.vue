<template>
  <q-layout > <!-- Be sure to play with the Layout demo on docs -->

    <q-page-container>
      <q-page padding class="column justify-center items-center" >
        <q-card inline style="width: 400px; height: 700px">
          <div class="row justify-center q-mt-md">
            <img alt="Quasar logo" src="statics/icons/favicon-96x96.png" width="72">
          </div>
          <q-card-section class="text-center">
            <div class="text-h4">MicroIoT Client</div>
            <div class="text-subtitle2">登录开启物联网之旅</div>
          </q-card-section>
          <div class="q-ma-md">
            <q-field
              label="用户"
              hint=""
              stack-label
              :error="$v.form.username.$error"
              error-message="用户名称不能为空"
            >
              <q-input v-model="form.username" autofocus/>
            </q-field>
            <q-field
              label="密码"
              hint=""
              stack-label
              :error="$v.form.password.$error"
              error-message="密码不能为空"
            >
              <q-input type="password" v-model="form.password"/>
            </q-field>
            <q-field
              label="服务器地址"
              hint=""
              stack-label
              :error="$v.form.server.$error"
              error-message="服务器地址不能为空"
            >
              <div class="row">
                <div  style="width: 30%"><q-select v-model="form.protocol"  :options="selectOptions" style="margin-left: 5px; margin: 0 auto"/></div>
                <div style="width: 70%"><q-input v-model="form.server"/></div>
              </div>
            </q-field>
            <q-field
              label="领域"
              hint=""
              stack-label
              :error="$v.form.domain.$error"
              error-message="领域名称不能为空"
            >
              <q-input v-model="form.domain"/>
            </q-field>
          </div>
          <q-card-actions  >
            <q-btn color="primary" style="width: 400px; max-width: 90vw" @click="login">登录</q-btn>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { http } from '../components/http'
import { stomp } from '../components/stomp'
export default {
  name: 'login',
  data () {
    return {
      leftDrawer: true,
      form: {
        username: '',
        password: '',
        server: '',
        domain: '',
        protocol: 'iotp://'
      },
      selectOptions: [
        {
          label: 'iotp://',
          value: 'iotp://'
        },
        {
          label: 'iotps://',
          value: 'iotps://'
        }
      ]
    }
  },
  validations: {
    form: {
      username: { required },
      password: { required },
      server: { required },
      domain: { required }
    }
  },
  methods: {
    login () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        return
      }
      let server = {
        host: this.form.server,
        protocol: this.form.protocol.value
      }
      this.$store.commit('server', server)

      let loginInfo = {
        'username': this.form.username,
        'password': this.form.password,
        'domain': this.form.domain
      }

      http('post', '/login', loginInfo, (response) => {
        this.$store.commit('token', response.data)
        http('get', '/domains/name/' + this.form.domain, '', (response) => {
          this.$store.commit('domain', response.data)
          http('get', '/users/me', '', (response) => {
            this.$store.commit('login', response.data)
            stomp.connect()
            this.$router.push({ path: '/home' })
          })
        })
      })
    }
  }
}
</script>
