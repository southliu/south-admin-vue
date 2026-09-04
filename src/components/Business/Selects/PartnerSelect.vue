<script setup lang="ts">
import ApiSelect from '@/components/Selects/ApiSelect.vue';
import { getPartner } from '@/servers/platform/partner';

defineOptions({ name: 'PartnerSelect' });
</script>

<template>
  <ApiSelect
    :api="getPartner"
    :field-names="{ label: 'name', value: 'id' }"
    v-bind="$attrs"
  />
</template>
