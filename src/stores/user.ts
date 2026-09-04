import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 用户信息 */
export interface UserInfo {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  roles: number[];
}

/** 用户store */
export const useUserStore = defineStore('user', () => {
  // 权限列表
  const permissions = ref<string[]>([]);
  // 用户信息
  const userInfo = ref<UserInfo>({
    id: 0,
    username: '',
    name: '',
    email: '',
    phone: '',
    roles: [],
  });

  /** 设置权限 */
  const setPermissions = (value: string[]) => {
    permissions.value = value;
  };

  /** 设置用户信息 */
  const setUserInfo = (value: UserInfo) => {
    userInfo.value = value;
  };

  /** 清除用户信息 */
  const clearInfo = () => {
    userInfo.value = {
      id: 0,
      username: '',
      name: '',
      email: '',
      phone: '',
      roles: [],
    };
  };

  return {
    permissions,
    userInfo,
    setPermissions,
    setUserInfo,
    clearInfo,
  };
});
