<script setup lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { Icon } from '@iconify/vue';
import { Input, Tooltip } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'IconInput' });

const value = defineModel<string>('value');

const { t } = useI18n();

/** 打开iconify图标库 */
const openIconLib = () => {
  window.open('https://icon-sets.iconify.design', '_blank');
};
</script>

<template>
  <div class="flex items-center">
    <Input v-model:value="value" v-bind="$attrs" />

    <div
      class="w-30px h-30px ml-10px b b-#d9d9d9 rd-6px flex items-center justify-center"
      :style="
        !value
          ? {
              backgroundImage:
                'repeating-linear-gradient(-45deg, #ececec, #ececec 2px, transparent 2px, transparent 5px)',
            }
          : {}
      "
    >
      <Icon v-if="value" :icon="value" class="text-16px" />
    </div>

    <Tooltip :title="t('systems.menu.helpIcon')">
      <div class="cursor-pointer pl-10px pr-2px" @click="openIconLib">
        <QuestionCircleOutlined />
      </div>
    </Tooltip>
  </div>
</template>
