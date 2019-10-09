<template>
  <q-expansion-item
    class="q-ma-md"
    switch-toggle-side
    expand-separator
    header-class="text-primary"
    :label="title"
    v-if="attributeDefinition && attributeDefinition !== null && Object.keys(attributeDefinition).length > 0" @show="setTab">
    <q-tabs dense align="center" narrow-indicator no-caps active-color="primary" v-model="tab">
      <q-tab :name="key" :label="key" v-for="(value, key) in attributeDefinition" :key="key"/>
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab">
      <q-tab-panel :name="key"  v-for="(value, key) in attributeDefinition" :key="key" >
        <div class="q-gutter-md q-mb-md">
          <q-btn color="primary" v-if="value.get" @click="$emit('get', key)">
            {{instance? '读取':'可读取'}}
          </q-btn>
          <q-btn color="primary" v-if="value.set" @click="$emit('set', key)">
            {{instance? '设置':'可设置'}}
          </q-btn>
          <q-btn color="primary" v-if="value.report" @click="report(key)">
            {{instance? '查询':'可上报'}}
          </q-btn>
        </div>
        <q-field stack-label  label="数据类型">
          <template v-slot:prepend>
            <q-icon name="event" color="primary"/>
          </template>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{getDataType(value)}}</div>
          </template>
        </q-field>
        <q-field stack-label label="是否可空" >
          <template v-slot:prepend>
            <q-icon name="event" color="primary"/>
          </template>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{getNull(value)}}</div>
          </template>
        </q-field>
        <q-field stack-label label="属性描述" >
          <template v-slot:prepend>
            <q-icon name="event" color="primary"/>
          </template>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{getDesc(value)}}</div>
          </template>
        </q-field>
        <AttributeDefinition title="类型信息" :attributeDefinition="value.dataType.attTypes" v-if="value.dataType.type === 'Struct' || value.dataType.type === 'Choice' "/>
        <AttributeDefinition title="类型信息(Struct)" :attributeDefinition="value.dataType.dataType.attTypes" v-else-if="value.dataType.type === 'Array'&& (value.dataType.dataType.type === 'Struct')"/>
        <AttributeDefinition title="类型信息(Choice)" :attributeDefinition="value.dataType.dataType.attTypes" v-else-if="value.dataType.type === 'Array'&& (value.dataType.dataType.type === 'Choice')"/>
        <q-field stack-label label="类型信息" v-else-if="value.dataType.type === 'Array' || value.dataType.type === 'String' || value.dataType.type === 'DateTime' || value.dataType.type === 'Enum'">
          <template v-slot:prepend>
            <q-icon name="event" color="primary"/>
          </template>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{getType(value)}}</div>
          </template>
        </q-field>
      </q-tab-panel>
    </q-tab-panels>
  </q-expansion-item>
</template>

<script>
import { getTypeInfo } from './util'

export default {
  name: 'AttributeDefinition',
  props: ['attributeDefinition', 'title', 'icon', 'instance'],
  data () {
    return {
      tab: ''
    }
  },
  methods: {
    getDataType (value) {
      return (value.dataType === null ? '' : value.dataType.type)
    },
    getNull (value) {
      return (value.optional ? '是' : '否')
    },
    getDesc (value) {
      return (value.description === null ? '' : value.description)
    },
    getType (value) {
      return (getTypeInfo(value.dataType))
    },
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
