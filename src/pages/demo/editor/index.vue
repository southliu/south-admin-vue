<script setup lang="ts">
import { ref } from 'vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import WangEditor from '@/components/WangEditor/index.vue';

defineOptions({ name: 'DemoEditor' });

// 编辑器内容
const valueHtml = ref('<p>hello</p>');
</script>

<template>
  <BaseContent>
    <div class="bg m-10px rounded-3 p-5px">
      <WangEditor v-model="valueHtml" />
    </div>
  </BaseContent>
</template>
