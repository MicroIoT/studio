<template>
  <q-expansion-item
    class="q-ma-md"
    switch-toggle-side
    expand-separator
    header-class="text-primary"
    :icon="icon"
    :label="title"
    :caption="subTitle"
    @before-show="$emit('read')"
    v-if="attributeValue !== null" @show="setTab">
    <q-tabs dense align="center" narrow-indicator no-caps active-color="primary" v-model="tab" v-if="attributeValue && Object.keys(attributeValue).length > 0" >
      <q-tab :name="getName(key)" :label="getName(key)"  v-for="(value, key) in attributeValue" :key="key"/>
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab">
      <q-tab-panel :name="getName(key)"  v-for="(value, key) in attributeValue" :key="key">
        <q-field dense v-if="typeof value !== 'undefined' && typeof value.string !== 'undefined' && typeof value.string === 'string'">
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{value.string}}</div>
          </template>
        </q-field>
        <AttributeValue :attributeValue="getValue(value)" v-else/>
      </q-tab-panel>
    </q-tab-panels>
  </q-expansion-item>
</template>

<script>
export default {
  name: 'AttributeValue',
  props: ['attributeValue', 'title', 'subTitle', 'icon'],
  data () {
    return {
      tab: ''
    }
  },
  methods: {
    setTab () {
      this.tab = Object.keys(this.attributeValue)[0]
    },
    getName (key) {
      if (Number.isInteger(key)) {
        key++
      }
      return key.toString()
    },
    getValue (value) {
      if (typeof value !== 'undefined' && typeof value.value !== 'undefined') {
        return value.value
      }
    }
  }
}
</script>

<style>
</style>
