<template>
  <q-item-label v-if="typeof dataValue !== 'undefined' && dataValue !== null && typeof dataValue.value !== 'object'">
      {{dataValue.string}}
  </q-item-label>
  <AttributeValue :attributeValue="getValue(dataValue)" v-else/>
</template>

<script>
import AttributeValue from './AttributeValue.vue'

export default {
  name: 'DataValue',
  props: ['dataValue'],
  components: {
    AttributeValue
  },
  data () {
    return {}
  },
  methods: {
    getValue (value) {
      if (typeof value !== 'undefined' && value !== null) {
        return value.value
      }
    }
  }
}
</script>

<style>
</style>
