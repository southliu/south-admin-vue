<script setup lang="ts">
import { Col, Row } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import Count from '@/components/Count/index.vue';
import { useCommonStore } from '@/hooks/useCommonStore';

defineOptions({ name: 'DashboardBlock' });

const { t } = useI18n();
const { isPhone } = useCommonStore();

const data = computed(() => [
  { title: t('dashboard.usersNumber'), num: 14966, all: 16236, icon: 'icon-park:peoples' },
  { title: t('dashboard.rechargeAmount'), num: 4286, all: 6142, icon: 'icon-park:paper-money' },
  { title: t('dashboard.orderNumber'), num: 5649, all: 5232, icon: 'icon-park:transaction-order' },
  { title: t('dashboard.gameNumber'), num: 619, all: 2132, icon: 'icon-park:game-handle' },
]);
</script>

<template>
  <Row :gutter="16">
    <Col
      v-for="item in data"
      :key="item.title"
      :sm="24"
      :md="12"
      :lg="6"
      :class="`pb-10px ${isPhone ? 'w-full' : ''}`"
    >
      <div class="border border-gray-200 box-border rounded-10px px-30px py-20px">
        <div class="text-20px font-bold">{{ item.title }}</div>
        <div class="mb-15px flex items-center justify-between text-35px">
          <Count class="font-bold" :value="item.num" />
          <Icon :icon="item.icon" />
        </div>
        <div class="flex items-center justify-between">
          <span>{{ t('public.total') }}：</span>
          <Count :value="item.all" />
        </div>
      </div>
    </Col>
  </Row>
</template>
