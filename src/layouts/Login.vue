<template>
  <q-layout > <!-- Be sure to play with the Layout demo on docs -->

    <q-page-container>
      <q-page padding class="column justify-center items-center" >
        <q-card inline style="width: 400px;">
          <div class="row justify-center q-mt-md">
            <img alt="Quasar logo" src="statics/icons/favicon-96x96.png" width="72">
          </div>
          <q-card-section class="text-center">
            <div class="text-h4">MicroIoT Studio</div>
            <div class="text-subtitle2">登录开启物联网之旅</div>
          </q-card-section>
          <div class="q-ma-md">
            <q-input class="self-center full-width no-outline" v-model="form.username" autofocus
               label="用户"
               :error="$v.form.username.$error"
               error-message="用户名称不能为空"/>
            <q-input class="self-center full-width no-outline" type="password" v-model="form.password"
               label="密码"
               :error="$v.form.password.$error"
               error-message="密码不能为空"/>
            <div class="row">
              <div class="col-4"><q-select v-model="form.protocol"  :options="selectOptions"/></div>
              <div class="col-8"><q-input class="self-center full-width no-outline" v-model="form.server"
                  label="服务器地址"
                  :error="$v.form.server.$error"
                  error-message="服务器地址不能为空"/></div>
            </div>
            <q-input class="self-center full-width no-outline" v-model="form.domain"
               label="领域"/>
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
import { initSystem } from '../components/util'

export default {
  name: 'login',
  data () {
    return {
      form: {
        username: '',
        password: '',
        server: '',
        domain: '',
        protocol: 'iotp://'
      },
      selectOptions: [
        'iotp://', 'iotps://'
      ]
    }
  },
  validations: {
    form: {
      username: { required },
      password: { required },
      server: { required }
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
        protocol: this.form.protocol
      }
      this.$store.commit('server', server)

      let loginInfo
      if (this.form.domain.length > 0) {
        loginInfo = {
          'username': this.form.username,
          'password': this.form.password,
          'domain': this.form.domain
        }
      } else {
        loginInfo = {
          'username': this.form.username,
          'password': this.form.password
        }
      }

      http('post', '/login', loginInfo, (response) => {
        this.$store.commit('token', response.data)
        http('get', '/users/me', '', (response) => {
          this.$store.commit('login', response.data)
          if (this.form.domain.length > 0) {
            initSystem()
            http('get', '/domains/name/' + this.form.domain, '', (response) => {
              this.$store.commit('domain', response.data)
            })
          } else {
            this.$store.commit('domain', '')
          }
          this.$router.push({ path: '/home' })
        })
      })
    }
  }
}
</script>
