<script setup lang="ts">
import ApiTreeSelect from '@/components/Selects/ApiTreeSelect.vue';
import { getGames } from '@/servers/platform/game';

defineOptions({ name: 'GameSelect' });
</script>

<template>
  <ApiTreeSelect
    :api="getGames"
    :field-names="{ label: 'name', value: 'id', children: 'children' }"
    tree-default-expand-all
    v-bind="$attrs"
  />
</template>
