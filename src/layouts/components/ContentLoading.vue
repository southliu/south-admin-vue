<script setup lang="ts">
/* From Uiverse.io by arthur_6104; MIT, alexruix / arthur_6104. */
import { useI18n } from 'vue-i18n';
import styles from './ContentLoading.module.less';
const { t } = useI18n();
</script>
<template>
  <div
    class="content-loading"
    role="status"
    :aria-label="t('public.loading')"
    aria-busy="true"
  >
    <div aria-hidden="true" :class="styles.loader">
      <div :class="styles.box1" />
      <div :class="styles.box2" />
      <div :class="styles.box3" />
    </div>
  </div>
</template>
<style scoped>
.content-loading {
  position: absolute;
  inset: 0;
  display: flex;
  min-height: 160px;
  height: 100%;
  align-items: center;
  justify-content: center;
}
</style>
