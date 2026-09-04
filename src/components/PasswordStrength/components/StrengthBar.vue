<script setup lang="ts">
defineOptions({ name: 'StrengthBar' });

defineProps<{
  strength: number;
}>();

const arr = new Array(5).fill(0).map((_, index) => index + 1);
</script>

<template>
  <div class="flex items-center">
    <div
      v-for="item in arr"
      :key="item"
      :class="`
        mr-1%
        mt-5px
        h-5px
        w-19%
        rounded-10px
        bg-light-900
        ${item <= strength && strength > 3 ? '!bg-green-400' : ''}
        ${item <= strength && strength === 3 ? '!bg-yellow-400' : ''}
        ${item <= strength && strength < 3 ? '!bg-red-400' : ''}
      `"
    ></div>
  </div>
</template>
