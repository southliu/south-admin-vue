<script setup lang="ts">
import { Tooltip } from 'ant-design-vue';
import { Icon } from '@iconify/vue';

defineOptions({ name: 'Github' });

/** 跳转Github */
const goGithub = () => {
  window.open('https://github.com/southliu/vue-admin');
};
</script>

<template>
  <Tooltip title="Github">
    <div @click="goGithub">
      <Icon
        class="mr-3 flex cursor-pointer items-center justify-center text-lg"
        icon="mdi:github"
      />
    </div>
  </Tooltip>
</template>
