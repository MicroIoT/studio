<template>
  <q-expansion-item
    class="q-ma-md"
    switch-toggle-side
    expand-separator
    header-class="text-primary"
    :label="title"
    v-if="attributeDefinition !== null && Object.keys(attributeDefinition).length > 0" @show="setTab">
    <q-tabs dense align="center" narrow-indicator no-caps active-color="primary" v-model="tab">
      <q-tab :name="key" :label="key" v-for="(value, key) in attributeDefinition" :key="key"/>
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab">
      <q-tab-panel :name="key"  v-for="(value, key) in attributeDefinition" :key="key" >
        <q-btn color="primary" v-if="value.get" @click="$emit('get', key)">读取</q-btn>
        <q-btn color="primary" v-if="value.set" @click="$emit('set', key)">设置</q-btn>
        <q-btn color="primary" v-if="value.report" @click="report(key)">查询</q-btn>
        <q-field :label="'数据类型：' + (value.dataType === null ? '' : value.dataType.type)"></q-field>
        <q-field :label="'是否可空：' + (value.optional ? '是' : '否')"></q-field>
        <q-field :label="'属性描述：' + (value.description === null?'' : value.description)"></q-field>
        <AttributeDefinition title="类型信息" :attributeDefinition="value.dataType.attTypes" v-if="value.dataType.type === 'Struct' || value.dataType.type === 'Choice' "/>
        <AttributeDefinition title="类型信息(Struct)" :attributeDefinition="value.dataType.dataType.attTypes" v-else-if="value.dataType.type === 'Array'&& (value.dataType.dataType.type === 'Struct')"/>
        <AttributeDefinition title="类型信息(Choice)" :attributeDefinition="value.dataType.dataType.attTypes" v-else-if="value.dataType.type === 'Array'&& (value.dataType.dataType.type === 'Choice')"/>
        <q-field :label="'类型信息：' + (getTypeInfo(value.dataType))" v-else-if="value.dataType.type === 'Array' || value.dataType.type === 'String' || value.dataType.type === 'DateTime' || value.dataType.type === 'Enum'"></q-field>
      </q-tab-panel>
    </q-tab-panels>
  </q-expansion-item>
</template>

<script>
import { getTypeInfo } from './util'

export default {
  name: 'AttributeDefinition',
  props: ['attributeDefinition', 'title', 'icon'],
  data () {
    return {
      tab: ''
    }
  },
  methods: {
    setTab () {
      this.tab = Object.keys(this.attributeDefinition)[0]
    },
    report (key) {
      this.$emit('report', key)
    },
    getTypeInfo (dataType) {
      return getTypeInfo(dataType)
    }
  }
}
</script>

<style>
</style>
