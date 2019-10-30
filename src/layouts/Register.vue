<template>
  <q-layout >
    <q-page-container>
      <q-page padding class="column justify-center items-center" >
        <q-card inline style="width: 400px;">
          <div class="row justify-center q-mt-md">
            <img alt="Quasar logo" src="statics/icons/favicon-96x96.png" width="72">
          </div>
          <q-card-section class="text-center">
            <div class="text-h4">MicroIoT Studio</div>
            <div class="text-subtitle2">注册开启物联网之旅</div>
          </q-card-section>
          <div class="q-ma-md">
            <q-input class="self-center full-width no-outline" v-model="form.username" autofocus
               label="电子邮件"
               :error="$v.form.username.$error"
               error-message="电子邮件格式错误"/>
            <q-input class="self-center full-width no-outline" type="password" v-model="form.password"
               label="密码"
               :error="$v.form.password.$error"
               error-message="密码不能为空"/>
            <q-input class="self-center full-width no-outline" type="password" v-model="form.repeatPassword"
               label="确认密码"
               :error="$v.form.repeatPassword.$error"
               error-message="密码不一致"/>
          </div>
          <q-card-actions  >
            <q-btn color="primary" style="width: 400px; max-width: 90vw" @click="register">注册</q-btn>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import { required, email, sameAs } from 'vuelidate/lib/validators'
import { http } from '../components/http'

export default {
  name: 'register',
  data () {
    return {
      form: {
        username: '',
        password: '',
        repeatPassword: ''
      }
    }
  },
  validations: {
    form: {
      username: { required, email },
      password: {
        required
      },
      repeatPassword: {
        sameAsPassword: sameAs('password')
      }
    }
  },
  methods: {
    register () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        return
      }

      let registerInfo = {
        'email': this.form.username,
        'password': this.form.password
      }

      http('post', '/users/register', registerInfo, (response) => {
        this.$q.dialog({
          title: '注册',
          message: '用户：' + response.data.username + ' 注册成功!<br><br>用户名：' + response.data.username + '<br>领域：' + response.data.username,
          ok: {
            label: '确定'
          },
          html: true,
          persistent: true
        }).onOk((data) => {
          this.$router.push({ path: '/' })
        })
      })
    }
  }
}
</script>
