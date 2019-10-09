<template>
    <q-item clickable v-close-popup @click="favorite" v-if="!favorited">
      <q-item-section avatar>
        <q-icon color="primary" name="favorite" />
      </q-item-section>
      <q-item-section>收藏</q-item-section>
    </q-item>
  <q-item clickable v-close-popup @click="favorite" v-else>
    <q-item-section avatar>
      <q-icon name="favorite" />
    </q-item-section>
    <q-item-section>取消收藏</q-item-section>
  </q-item>
</template>

<script>
import { http } from './http'

export default {
  name: 'Favorite',
  props: ['type', 'name', 'id'],
  computed: {
    getName: function () {
      return this.name
    },
    getId: function () {
      return this.id
    }
  },
  data () {
    return {
      favorited: false,
      favor: {}
    }
  },
  created: function () {
    this.exist()
  },
  methods: {
    favorite () {
      if (!this.favorited) {
        var data = {
          'name': this.getName,
          'id': this.getId
        }
        http('post', '/favorites', data, (response) => {
          this.$q.notify({
            message: '已收藏',
            color: 'positive'
          })
          this.favorited = true
        })
      } else {
        http('delete', '/favorites/' + this.favor.id, data, (response) => {
          this.$q.notify({
            message: '取消收藏',
            color: 'positive'
          })
          this.favorited = false
        })
      }
    },
    exist () {
      let existUrl = '/favorites/exist'
      let param = { params: { favoriteId: this.getId } }
      http('get', existUrl, param, (response) => {
        if (response.data) {
          this.favorited = true
          this.favor = response.data
        } else {
          this.favorited = false
        }
      })
    }
  }
}
</script>

<style>
</style>
