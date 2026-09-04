import '@/assets/css/public.less';
import '@/assets/fonts/font.less';
import 'uno.css';
import 'nprogress/nprogress.css';
import '@/assets/css/scrollbar.less';
import '@/assets/css/theme-color.less';
import '@/utils/icons';
import i18n from '@/locales/config';
import '@/assets/css/antd.less';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { routerIntercept } from './router/utils/intercept';
import { store } from './stores';

dayjs.locale('zh-cn');

const app = createApp(App);

app.use(store);
app.use(i18n);
app.use(router);

// 挂载后注册路由拦截器
routerIntercept(router);

router.isReady().then(() => {
  app.mount('#app');

  // 隐藏首屏loading
  const first = document.getElementById('first');
  if (first) {
    first.style.display = 'none';
  }
});
