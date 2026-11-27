<script setup lang="ts">
import type { BaseFormData } from '#/form';
import type {
  HrCollectionSettings,
  HrCollectionTask,
  HrDepartmentItem,
  HrRecordItem,
  HrRecordStats,
} from '@/servers/hr/record';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Progress,
  Radio,
  Select,
  Statistic,
  Switch,
  Tag,
} from 'ant-design-vue';
import {
  CloudUploadOutlined,
  DesktopOutlined,
  ApartmentOutlined,
  SettingOutlined,
  WechatOutlined,
} from '@ant-design/icons-vue';
import { computed, onActivated, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BasePagination from '@/components/Pagination/BasePagination.vue';
import BaseSearch from '@/components/Search/BaseSearch.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import { useCommonStore } from '@/hooks/useCommonStore';
import {
  getHrCollectionStatus,
  getHrCollectionSettings,
  getHrDepartments,
  getHrRecordPage,
  getHrRecordStats,
  startHrCollection,
  syncHrRecords,
  updateHrCollectionSettings,
} from '@/servers/hr/record';
import { checkPermission, hasPermission } from '@/utils/permissions';
import { INIT_PAGINATION } from '@/utils/config';
import { message } from '@/utils/message';
import { searchList, tableColumns } from './model';

defineOptions({ name: 'HrRecord' });

const { permissions } = useCommonStore();
const pagePermission = computed(() =>
  checkPermission('/hr/record', permissions.value),
);
const canSync = computed(() => hasPermission('/hr/record/sync', permissions.value));
const isLoading = ref(false);
const isCollectorOpen = ref(false);
const isSettingsOpen = ref(false);
const isDepartmentsOpen = ref(false);
const isDepartmentsLoading = ref(false);
const isSavingSettings = ref(false);
const collectorTask = ref<HrCollectionTask>({
  status: 'idle',
  stage: 'idle',
  message: '尚未开始采集',
  percent: 0,
  recordCount: 0,
  departmentCount: 0,
});
const isCollecting = computed(() => collectorTask.value.status === 'running');
const searchData = ref<BaseFormData>({});
const page = ref(INIT_PAGINATION.page);
const pageSize = ref(INIT_PAGINATION.pageSize);
const total = ref(0);
const tableData = ref<HrRecordItem[]>([]);
const stats = ref<HrRecordStats>({ onboarding: 0, leave: 0, resignation: 0, total: 0 });
const departments = ref<HrDepartmentItem[]>([]);
const groupedDepartments = computed(() => {
  const groups = new Map<string, HrDepartmentItem[]>();
  for (const department of departments.value) {
    const items = groups.get(department.company) || [];
    items.push(department);
    groups.set(department.company, items);
  }
  return Array.from(groups, ([company, items]) => ({ company, items }));
});
const collectionSettings = ref<HrCollectionSettings>({
  wecomConfigured: false,
  wecomLookbackDays: 31,
  wecomOnboardingTemplateIds: [],
  wecomLeaveTemplateIds: [],
  wecomResignationTemplateIds: [],
  scheduleEnabled: false,
  scheduleFrequency: 'daily',
  scheduleTime: '09:00',
  scheduleWeekdays: [1],
  schedulePlatforms: ['dingtalk'],
});
const weekdayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
];
const wecomSecret = ref('');
const onboardingTemplateIds = ref('');
const leaveTemplateIds = ref('');
const resignationTemplateIds = ref('');
const fileInput = useTemplateRef<HTMLInputElement>('fileInput');
let collectorTimer: ReturnType<typeof setTimeout> | undefined;

const loadData = async () => {
  try {
    isLoading.value = true;
    const params = {
      ...searchData.value,
      page: page.value,
      pageSize: pageSize.value,
    };
    const [pageResult, statsResult] = await Promise.all([
      getHrRecordPage(params),
      getHrRecordStats(),
    ]);
    if (Number(pageResult.code) === 200) {
      tableData.value = pageResult.data.items || [];
      total.value = pageResult.data.total || 0;
    }
    if (Number(statsResult.code) === 200) stats.value = statsResult.data;
  } finally {
    isLoading.value = false;
  }
};

const loadCollectionSettings = async () => {
  const result = await getHrCollectionSettings();
  if (Number(result.code) !== 200) return;
  collectionSettings.value = result.data;
  onboardingTemplateIds.value = result.data.wecomOnboardingTemplateIds.join('\n');
  leaveTemplateIds.value = result.data.wecomLeaveTemplateIds.join('\n');
  resignationTemplateIds.value = result.data.wecomResignationTemplateIds.join('\n');
};

const openDepartments = async () => {
  isDepartmentsOpen.value = true;
  try {
    isDepartmentsLoading.value = true;
    const result = await getHrDepartments();
    if (Number(result.code) === 200) departments.value = result.data || [];
  } finally {
    isDepartmentsLoading.value = false;
  }
};

const onSearch = (values: BaseFormData) => {
  page.value = 1;
  searchData.value = values;
  loadData();
};

const onChangePagination = (currentPage: number, currentPageSize: number) => {
  page.value = currentPage;
  pageSize.value = currentPageSize;
  loadData();
};

const stopCollectorPolling = () => {
  if (collectorTimer) clearTimeout(collectorTimer);
  collectorTimer = undefined;
};

const pollCollectorStatus = async () => {
  stopCollectorPolling();
  try {
    const result = await getHrCollectionStatus();
    if (Number(result.code) !== 200) return;
    collectorTask.value = result.data;
    if (result.data.status === 'running') {
      collectorTimer = setTimeout(pollCollectorStatus, 1500);
      return;
    }
    if (result.data.status === 'succeeded') {
      message.success(result.data.message);
      await loadData();
    } else if (result.data.status === 'partial') {
      message.warning(result.data.message);
      await loadData();
    } else if (result.data.status === 'failed') {
      message.error(result.data.message || '采集失败');
    }
  } catch (error) {
    collectorTask.value = {
      ...collectorTask.value,
      status: 'failed',
      message: error instanceof Error ? error.message : '无法获取采集进度',
    };
  }
};

const runCollector = async (platforms: Array<'dingtalk' | 'wecom'>) => {
  if (platforms.includes('wecom') && !collectionSettings.value.wecomConfigured) {
    isSettingsOpen.value = true;
    message.warning('请先配置企业微信审批接口');
    return;
  }
  isCollectorOpen.value = true;
  collectorTask.value = {
    ...collectorTask.value,
    status: 'running',
    stage: 'queued',
    message: '正在创建采集任务',
    percent: 0,
  };
  try {
    const result = await startHrCollection(platforms);
    if (Number(result.code) !== 200) throw new Error(result.message || '启动采集失败');
    collectorTask.value = result.data;
    await pollCollectorStatus();
  } catch (error) {
    collectorTask.value = {
      ...collectorTask.value,
      status: 'failed',
      message: error instanceof Error ? error.message : '启动采集失败',
    };
  }
};

const runDingTalkCollector = () => runCollector(['dingtalk']);
const runWeComCollector = () => runCollector(['wecom']);
const runAllCollectors = () => runCollector(['dingtalk', 'wecom']);

const splitTemplateIds = (value: string) =>
  value
    .split(/[\s,，]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const saveCollectionSettings = async () => {
  if (
    collectionSettings.value.scheduleEnabled
    && collectionSettings.value.scheduleFrequency === 'weekly'
    && !collectionSettings.value.scheduleWeekdays.length
  ) {
    message.warning('每周执行时至少选择一个星期');
    return;
  }
  if (
    collectionSettings.value.scheduleEnabled
    && !collectionSettings.value.schedulePlatforms.length
  ) {
    message.warning('请至少选择一个采集来源');
    return;
  }
  try {
    isSavingSettings.value = true;
    const result = await updateHrCollectionSettings({
      wecomCorpId: collectionSettings.value.wecomCorpId,
      wecomSecret: wecomSecret.value || undefined,
      wecomLookbackDays: collectionSettings.value.wecomLookbackDays,
      wecomOnboardingTemplateIds: splitTemplateIds(onboardingTemplateIds.value),
      wecomLeaveTemplateIds: splitTemplateIds(leaveTemplateIds.value),
      wecomResignationTemplateIds: splitTemplateIds(resignationTemplateIds.value),
      scheduleEnabled: collectionSettings.value.scheduleEnabled,
      scheduleFrequency: collectionSettings.value.scheduleFrequency,
      scheduleTime: collectionSettings.value.scheduleTime,
      scheduleWeekdays: collectionSettings.value.scheduleWeekdays,
      schedulePlatforms: collectionSettings.value.schedulePlatforms,
    });
    if (Number(result.code) !== 200) throw new Error(result.message || '保存失败');
    collectionSettings.value = result.data;
    wecomSecret.value = '';
    isSettingsOpen.value = false;
    message.success('采集设置已保存');
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存采集设置失败');
  } finally {
    isSavingSettings.value = false;
  }
};

const openFilePicker = () => fileInput.value?.click();

const importResult = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  try {
    isLoading.value = true;
    const parsed = JSON.parse(await file.text()) as
      | Record<string, unknown>[]
      | { records?: Record<string, unknown>[] };
    const records = Array.isArray(parsed) ? parsed : parsed.records;
    if (!records?.length) throw new Error('文件中没有可同步的 records');
    const result = await syncHrRecords(records);
    if (Number(result.code) === 200) {
      const { created, updated } = result.data;
      message.success(`导入完成：新增 ${created} 条，更新 ${updated} 条`);
      await loadData();
    }
  } catch (error) {
    message.error(error instanceof Error ? error.message : '导入文件失败');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (pagePermission.value.page) {
    loadData();
    loadCollectionSettings();
    pollCollectorStatus();
  }
});
onActivated(loadData);
onBeforeUnmount(stopCollectorPolling);
</script>

<template>
  <BaseContent :is-permission="pagePermission.page">
    <div class="mb-10px grid grid-cols-1 gap-10px md:grid-cols-5">
      <Card size="small"><Statistic title="全部记录" :value="stats.total" /></Card>
      <Card size="small"><Statistic title="入职记录" :value="stats.onboarding" /></Card>
      <Card size="small"><Statistic title="请假记录" :value="stats.leave" /></Card>
      <Card size="small"><Statistic title="离职记录" :value="stats.resignation" /></Card>
      <Card size="small">
        <Statistic title="最近采集" :value="stats.lastCollectedAt || '尚未采集'" />
      </Card>
    </div>

    <BaseCard>
      <BaseSearch
        :list="searchList"
        :data="searchData"
        :is-loading="isLoading"
        @handle-finish="onSearch"
      />
    </BaseCard>

    <BaseCard class="mt-10px">
      <BaseTable
        :is-loading="isLoading"
        :columns="tableColumns"
        :data-source="tableData"
        :scroll-x="2100"
        @get-page="loadData"
      >
        <template #leftContent>
          <Button v-if="canSync" type="primary" :loading="isCollecting" @click="runDingTalkCollector">
            <template #icon><DesktopOutlined /></template>
            采集钉钉
          </Button>
          <Button v-if="canSync" :loading="isCollecting" @click="runWeComCollector">
            <template #icon><WechatOutlined /></template>
            采集企业微信
          </Button>
          <Button
            v-if="canSync && collectionSettings.wecomConfigured"
            :loading="isCollecting"
            @click="runAllCollectors"
          >
            全部采集
          </Button>
          <Button v-if="canSync" @click="isSettingsOpen = true">
            <template #icon><SettingOutlined /></template>
            采集设置
          </Button>
          <Button :loading="isDepartmentsLoading" @click="openDepartments">
            <template #icon><ApartmentOutlined /></template>
            通讯录部门
          </Button>
          <Button v-if="canSync" :loading="isLoading" @click="openFilePicker">
            <template #icon><CloudUploadOutlined /></template>
            导入采集结果
          </Button>
          <input
            ref="fileInput"
            class="hidden"
            type="file"
            accept="application/json,.json"
            @change="importResult"
          />
        </template>
      </BaseTable>

      <BasePagination
        :disabled="isLoading"
        :current="page"
        :page-size="pageSize"
        :total="total"
        @change="onChangePagination"
      />
    </BaseCard>

    <Modal v-model:open="isCollectorOpen" title="人事记录自动采集" :footer="null">
      <Alert
        class="mb-16px"
        :type="collectorTask.status === 'failed' ? 'error' : collectorTask.status === 'succeeded' ? 'success' : collectorTask.status === 'partial' ? 'warning' : 'info'"
        :message="collectorTask.message"
        show-icon
      />
      <Progress
        :percent="collectorTask.percent"
        :status="collectorTask.status === 'failed' ? 'exception' : collectorTask.status === 'succeeded' ? 'success' : 'active'"
      />
      <p class="mt-12px color-#666">
        钉钉会在本机真实打开：逐个切换企业主体，先读取“通讯录 → 组织架构”的部门，再进入工作台、OA审批读取入职/请假/离职历史；采集时请保持电脑解锁。企业微信通过审批接口采集，不占用桌面。
      </p>
      <Alert
        v-for="(source, platform) in collectorTask.sourceResults"
        :key="platform"
        class="mb-8px"
        :type="source.status === 'succeeded' ? 'success' : 'error'"
        :message="`${platform === 'dingtalk' ? '钉钉' : '企业微信'}：${source.message}`"
        show-icon
      />
      <p v-if="collectorTask.startedAt" class="color-#999">开始时间：{{ collectorTask.startedAt }}</p>
      <Button
        v-if="collectorTask.status === 'failed' || collectorTask.status === 'succeeded'"
        type="primary"
        @click="runCollector(collectorTask.platforms || ['dingtalk'])"
      >
        重新采集
      </Button>
    </Modal>

    <Modal v-model:open="isDepartmentsOpen" title="通讯录部门" :footer="null" width="720px">
      <div v-if="isDepartmentsLoading" class="py-24px text-center color-#999">正在加载...</div>
      <div v-else-if="!groupedDepartments.length" class="py-24px text-center color-#999">
        尚未采集部门，请先点击“采集钉钉”
      </div>
      <div v-else class="grid gap-16px">
        <section v-for="group in groupedDepartments" :key="group.company">
          <div class="mb-8px font-600">{{ group.company }}</div>
          <div class="flex flex-wrap gap-8px">
            <Tag v-for="department in group.items" :key="department.id" color="blue">
              {{ department.name }}（{{ department.memberCount ?? '-' }} 人）
            </Tag>
          </div>
        </section>
      </div>
    </Modal>

    <Modal
      v-model:open="isSettingsOpen"
      title="采集与定时设置"
      :confirm-loading="isSavingSettings"
      ok-text="保存"
      cancel-text="取消"
      @ok="saveCollectionSettings"
    >
      <Alert
        class="mb-16px"
        type="info"
        message="企业微信需在管理后台的“应用管理 → 审批 → API”获取 Secret；Secret 保存后不会回显。模板 ID 可留空，系统会按审批名称识别入职、请假和离职。"
        show-icon
      />
      <div class="grid gap-12px">
        <label>
          <div class="mb-4px">企业 ID（CorpID）</div>
          <Input v-model:value="collectionSettings.wecomCorpId" placeholder="例如 ww1234567890abcdef" />
        </label>
        <label>
          <div class="mb-4px">审批应用 Secret</div>
          <Input.Password
            v-model:value="wecomSecret"
            :placeholder="collectionSettings.wecomConfigured ? '已保存；留空表示不修改' : '请输入审批应用 Secret'"
          />
        </label>
        <label>
          <div class="mb-4px">采集最近天数（最多 31 天）</div>
          <InputNumber v-model:value="collectionSettings.wecomLookbackDays" :min="1" :max="31" />
        </label>
        <label>
          <div class="mb-4px">入职模板 ID（可选，每行一个）</div>
          <Input.TextArea v-model:value="onboardingTemplateIds" :rows="2" />
        </label>
        <label>
          <div class="mb-4px">请假模板 ID（可选，每行一个）</div>
          <Input.TextArea v-model:value="leaveTemplateIds" :rows="2" />
        </label>
        <label>
          <div class="mb-4px">离职模板 ID（可选，每行一个）</div>
          <Input.TextArea v-model:value="resignationTemplateIds" :rows="2" />
        </label>
        <div class="flex items-center gap-10px">
          <Switch v-model:checked="collectionSettings.scheduleEnabled" />
          <span>启用定时采集</span>
        </div>
        <div v-if="collectionSettings.scheduleEnabled" class="grid gap-12px rounded bg-#fafafa p-12px">
          <label>
            <div class="mb-6px">执行周期</div>
            <Radio.Group v-model:value="collectionSettings.scheduleFrequency" button-style="solid">
              <Radio.Button value="daily">每天</Radio.Button>
              <Radio.Button value="weekly">每周</Radio.Button>
            </Radio.Group>
          </label>
          <label v-if="collectionSettings.scheduleFrequency === 'weekly'">
            <div class="mb-6px">每周执行日</div>
            <Select
              v-model:value="collectionSettings.scheduleWeekdays"
              class="w-full"
              mode="multiple"
              placeholder="请选择星期"
              :options="weekdayOptions"
            />
          </label>
          <label>
            <div class="mb-6px">执行时间</div>
            <input
              v-model="collectionSettings.scheduleTime"
              class="border border-#d9d9d9 rounded px-8px py-4px"
              type="time"
            />
          </label>
        </div>
        <div v-if="collectionSettings.scheduleEnabled">
          <div class="mb-6px">定时采集来源</div>
          <Checkbox.Group v-model:value="collectionSettings.schedulePlatforms">
            <Checkbox value="dingtalk">钉钉</Checkbox>
            <Checkbox value="wecom">企业微信</Checkbox>
          </Checkbox.Group>
        </div>
        <Alert
          v-if="collectionSettings.scheduleEnabled && collectionSettings.schedulePlatforms.includes('dingtalk')"
          type="warning"
          message="定时采集钉钉时，后端必须运行在当前登录的 Windows 用户会话中，并保持电脑解锁。"
          show-icon
        />
        <p v-if="collectionSettings.nextScheduledAt" class="m-0 color-#666">
          下次执行：{{ collectionSettings.nextScheduledAt.replace('T', ' ') }}
        </p>
        <p v-if="collectionSettings.lastScheduledRunDate" class="m-0 color-#999">
          最近定时任务：{{ collectionSettings.lastScheduledRunDate }}，{{ collectionSettings.lastScheduledMessage }}
        </p>
      </div>
    </Modal>
  </BaseContent>
</template>
