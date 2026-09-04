<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';

defineOptions({ name: 'DemoIdDynamic' });

const route = useRoute();

// 动态参数
const id = computed(() => route.params.id);
</script>

<template>
  <BaseContent>
    <BaseCard class="mx-5px mt-10px">
      <div>/demo/123/dynamic中的123为动态参数，可自由修改，文件路径为：/demo/[id]/dynamic。</div>
      <div>
        id: <span class="font-bold">{{ id }}</span>
      </div>
    </BaseCard>
  </BaseContent>
</template>
