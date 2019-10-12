<template>
  <q-page class="flex justify-center q-ma-md">
    <q-pull-to-refresh @refresh="refresh">
      <div style="width: 800px">
        <q-toolbar class="text-primary q-my-lg">
          <q-btn flat round dense icon="favorite" />
          <q-toolbar-title>
            收藏
          </q-toolbar-title>
        </q-toolbar>
        <q-card class="q-ma-md">
          <q-card-section>
            <q-infinite-scroll @load="loadMore" ref="scroll" >
              <q-list highlight separator>
                <q-item v-for="favorite in favorites" :key="favorite.id">
                  <q-item-section avatar v-if="$q.screen.gt.xs">
                    <q-icon color="primary" :name="favorite.mo.type === 'site'? 'location_city':'devices'" />
                  </q-item-section>
                  <q-item-section @click="goto(favorite.mo.type, favorite.mo.id)" class="cursor-pointer">
                    <q-item-label >{{favorite.name}}</q-item-label>
                  </q-item-section>
                  <q-item-section side >
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn class="gt-xs" size="12px" flat dense round icon="edit" color="secondary" @click="rename(favorite)">
                        <q-tooltip>重命名</q-tooltip>
                      </q-btn>
                      <q-btn size="12px" flat dense round icon="delete" color="red" @click="del(favorite.id)">
                        <q-tooltip>删除</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-infinite-scroll>
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { http } from '../../components/http'

export default {
  name: 'favorites',
  data () {
    return {
      favorites: []
    }
  },
  computed: {
  },
  methods: {
    goto (type, id) {
      let url = '/home/sites/root/' + type + '/' + id
      this.$router.push({ path: url })
    },
    del (id) {
      let delUrl = '/favorites/' + id
      http('delete', delUrl, '', (response) => {
        this.refreshList()
      })
    },
    rename (favorite) {
      this.$q.dialog({
        title: '编辑',
        message: '请输入收藏名称',
        prompt: {
          type: 'text',
          model: favorite.name
        },
        ok: {
          label: '确定'
        }
      }).onOk((data) => {
        let editUrl = '/favorites'
        let info = {
          'id': favorite.id,
          'newName': data
        }
        http('patch', editUrl, info, (response) => {
          this.refreshList()
        })
      })
    },
    refresh (done) {
      this.refreshList()
      done()
    },
    refreshList () {
      this.favorites = []
      this.$refs.scroll.reset()
      this.$refs.scroll.resume()
      this.$refs.scroll.trigger()
    },
    loadMore (pageNo, done) {
      pageNo--
      let pid = { params: { currentPage: pageNo } }

      http('get', '/favorites', pid, (response) => {
        done()
        if (response.data.totalElements > 0) {
          this.favorites.push(...response.data.content)
          if (response.data.last) {
            this.$refs.scroll.stop()
          }
        } else {
          this.$refs.scroll.stop()
        }
      })
    }
  }
}
</script>

<style>
</style>
