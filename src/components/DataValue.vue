<template>
  <q-item-label v-if="typeof dataValue !== 'undefined' && typeof dataValue.value !== 'object'">
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
      if (typeof value !== 'undefined') {
        return value.value
      }
    }
  }
}
</script>

<style>
</style>
