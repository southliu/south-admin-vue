<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseContent from '@/components/Content/BaseContent.vue';
import CopyBtn from '@/components/Copy/CopyBtn.vue';
import CopyInput from '@/components/Copy/CopyInput.vue';

defineOptions({ name: 'DemoCopy' });

const { t } = useI18n();
</script>

<template>
  <BaseContent>
    <div class="bg m-10px max-w-350px rounded-3 p-5px">
      <h1>{{ t('content.clipboard') }}：</h1>
      <CopyInput class="w-350px" />

      <div class="mt-50px flex items-center">
        <span class="text-lg">{{ t('content.clipboardMessage') }}：</span>
        <CopyBtn :text="t('public.copy')" value="admin" />
      </div>
    </div>
  </BaseContent>
</template>
