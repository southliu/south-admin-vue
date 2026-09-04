<script setup lang="ts">
defineOptions({ name: 'BaseCard' });
</script>

<template>
  <div
    id="card"
    class="box-border relative h-full overflow-auto rounded-3 px-5 py-3"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
