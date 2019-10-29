<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="arrow_back" @click="$router.back()"/>
          <q-toolbar-title>
            用户详细信息
          </q-toolbar-title>
          <q-btn flat round dense icon="more_vert" v-if="me">
            <q-menu>
              <q-list >
                <q-item clickable v-close-popup @click="showDialog = true">
                  <q-item-section avatar>
                    <q-icon color="primary" name="edit" />
                  </q-item-section>
                  <q-item-section>修改密码</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-list>
              <q-item >
                <q-item-section avatar>
                  <q-icon color="primary" name="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{user.username}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card class="q-pb-xs">
              <q-field stack-label class="q-ma-md" label="角色">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control >
                  <div class="self-center full-width no-outline" tabindex="0">{{getRole()}}</div>
                </template>
              </q-field>
              <q-field stack-label class="q-ma-md" label="电子邮件">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary"/>
                </template>
                <template v-slot:control >
                  <div class="self-center full-width no-outline" tabindex="0">{{user.email}}</div>
                </template>
              </q-field>
              <q-expansion-item
                class="q-ma-md"
                switch-toggle-side
                expand-separator
                header-class="text-primary"
                label="负责区域"
                v-if="user.isArea">
                <q-list separator>
                  <q-item v-for="site in visibleSite" :key="site.id">
                    <q-item-section avatar >
                      <q-icon :name="getSiteIcon(site.type)" color="primary"></q-icon>
                    </q-item-section>
                    <q-item-section  class="cursor-pointer">
                      <q-item-label color="primary" @click="goto(site.type, site.id)">{{site.string}}</q-item-label>
                    </q-item-section>
                    <q-item-section side @click="goto(site.type, site.id)">
                      <q-btn color="secondary" size="12px" flat dense round icon="info" >
                        <q-tooltip>详情</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 400px;">
        <q-card-section >
          <div class="text-h6">修改密码</div>
        </q-card-section>
        <div class="q-ma-md">
          <q-field
            label="原密码"
            hint=""
            stack-label
            :error="$v.form.original.$error"
            error-message="原密码不能为空"
          >
            <q-input class="self-center full-width no-outline" type="password" v-model="form.original" autofocus/>
          </q-field>
          <q-field
            label="密码"
            hint=""
            stack-label
            :error="$v.form.password.$error"
            error-message="密码不能为空"
          >
            <q-input class="self-center full-width no-outline" type="password" v-model="form.password"/>
          </q-field>
          <q-field
            label="重复密码"
            hint=""
            stack-label
            :error="$v.form.repeatPassword.$error"
            error-message="密码不一致"
          >
            <q-input class="self-center full-width no-outline" type="password" v-model="form.repeatPassword"/>
          </q-field>
        </div>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" label="确定" @click="updatePassword"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { http } from '../../components/http'
import { required, sameAs } from 'vuelidate/lib/validators'

export default {
  name: 'user',
  data () {
    return {
      me: false,
      username: '',
      user: {
        area: []
      },
      showDialog: false,
      form: {
        original: '',
        password: '',
        repeatPassword: ''
      }
    }
  },
  validations: {
    form: {
      original: { required },
      password: { required },
      repeatPassword: { sameAsPassword: sameAs('password') }
    }
  },
  computed: {
    visibleSite () {
      return this.user.area.filter(site => this.ifShow(site))
    }
  },
  created: function () {
    this.username = this.$route.params.username
    if (this.username === this.$store.getters.getCurrentUser.username) {
      this.me = true
    }
    this.getUserInfo()
  },
  methods: {
    goto (type, id) {
      if (type === 'domain') {
        this.$router.push({ path: '/home/sites/root' })
      } else {
        let url = '/home/sites/root/' + type + '/' + id
        this.$router.push({ path: url })
      }
    },
    getRole () {
      if (this.user.isSystem) {
        return '系统管理员'
      } else {
        return '区域管理员'
      }
    },
    ifShow (site) {
      if (site.type === 'site' && site.domain.id === this.$store.getters.getDomain.id) {
        return true
      } else if (site.type === 'domain' && site.id === this.$store.getters.getDomain.id) {
        return true
      } else if (site.type === 'device' && site.domain.id === this.$store.getters.getDomain.id) {
        return true
      } else {
        return false
      }
    },
    getSiteIcon (type) {
      if (type === 'site') {
        return 'location_city'
      } else if (type === 'domain') {
        return 'folder_open'
      } else {
        return 'devices'
      }
    },
    refresh (done) {
      done()
      this.getUserInfo()
      this.isMySite()
    },
    getUserInfo () {
      let url
      if (this.me) {
        url = '/users/me'
      } else {
        url = '/users/' + this.username
      }
      http('get', url, '', (response) => {
        this.user = response.data
      })
    },
    updatePassword () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        return
      }
      let data = {
        'original': this.form.original,
        'password': this.form.password
      }
      http('patch', '/users/password', data, (response) => {
        this.showDialog = false
        this.$q.dialog({
          title: '修改密码',
          message: '密码修改成功!',
          ok: {
            label: '确定'
          }
        }).onOk((data) => {
          this.form = {
            original: '',
            password: '',
            repeatPassword: ''
          }
        })
      })
    }
  }
}
</script>

<style>
</style>
