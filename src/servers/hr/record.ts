import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/servers';

const URL = '/hr/record';

export interface HrRecordItem {
  [key: string]: unknown;
  id: number;
  recordType: 'onboarding' | 'leave' | 'resignation';
  sourcePlatform: 'dingtalk' | 'wecom';
  applicantName: string;
  mobile?: string;
  sourceUserId?: string;
  approvalNo?: string;
  company?: string;
  department?: string;
  position?: string;
  employeeType?: string;
  leaveType?: string;
  startTime?: string;
  endTime?: string;
  durationDays?: number;
  durationValue?: number;
  durationUnit?: string;
  entryDate?: string;
  effectiveDate?: string;
  reason?: string;
  status?: string;
  collectedAt: string;
}

export interface HrRecordStats {
  onboarding: number;
  leave: number;
  resignation: number;
  total: number;
  lastCollectedAt?: string;
}

export interface HrDepartmentItem {
  id: number;
  sourcePlatform: 'dingtalk' | 'wecom';
  company: string;
  name: string;
  memberCount?: number;
  collectedAt: string;
}

export interface HrCollectionTask {
  taskId?: string;
  status: 'idle' | 'running' | 'succeeded' | 'partial' | 'failed';
  stage: string;
  message: string;
  percent: number;
  recordCount: number;
  departmentCount: number;
  platforms?: Array<'dingtalk' | 'wecom'>;
  trigger?: 'manual' | 'schedule';
  sourceResults?: Record<
    string,
    {
      status: 'succeeded' | 'failed';
      recordCount: number;
      departmentCount: number;
      message: string;
    }
  >;
  syncResult?: {
    created: number;
    updated: number;
    total: number;
  };
  startedAt?: string;
  finishedAt?: string;
  started?: boolean;
}

export interface HrRecordQuery extends PaginationData {
  recordType?: string;
  sourcePlatform?: string;
  applicantName?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function getHrRecordPage(data: HrRecordQuery) {
  return request.get<PageServerResult<HrRecordItem[]>>(`${URL}/page`, { params: data });
}

export function getHrRecordStats() {
  return request.get<HrRecordStats>(`${URL}/stats`);
}

export function getHrDepartments() {
  return request.get<HrDepartmentItem[]>(`${URL}/departments`);
}

export function syncHrRecords(records: Record<string, unknown>[]) {
  return request.post<{ created: number; updated: number; total: number }>(`${URL}/sync`, {
    records,
  });
}

export interface HrCollectionSettings {
  wecomCorpId?: string;
  wecomConfigured: boolean;
  wecomLookbackDays: number;
  wecomOnboardingTemplateIds: string[];
  wecomLeaveTemplateIds: string[];
  wecomResignationTemplateIds: string[];
  scheduleEnabled: boolean;
  scheduleFrequency: 'daily' | 'weekly';
  scheduleTime: string;
  scheduleWeekdays: number[];
  schedulePlatforms: Array<'dingtalk' | 'wecom'>;
  nextScheduledAt?: string;
  lastScheduledRunDate?: string;
  lastScheduledStatus?: string;
  lastScheduledMessage?: string;
}

export interface HrCollectionSettingsUpdate extends Omit<HrCollectionSettings, 'wecomConfigured' | 'nextScheduledAt' | 'lastScheduledRunDate' | 'lastScheduledStatus' | 'lastScheduledMessage'> {
  wecomSecret?: string;
}

export function startHrCollection(platforms: Array<'dingtalk' | 'wecom'>) {
  return request.post<HrCollectionTask>(`${URL}/collect`, { platforms });
}

export function getHrCollectionStatus() {
  return request.get<HrCollectionTask>(`${URL}/collect/status`);
}

export function getHrCollectionSettings() {
  return request.get<HrCollectionSettings>(`${URL}/collection/settings`);
}

export function updateHrCollectionSettings(data: HrCollectionSettingsUpdate) {
  return request.put<HrCollectionSettings>(`${URL}/collection/settings`, data);
}
