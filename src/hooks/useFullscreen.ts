import { usePublicStore } from '@/stores/public';

/**
 * 全屏操作
 */
export function useFullscreen() {
  const publicStore = usePublicStore();

  /** 切换全屏 */
  const toggleFullscreen = () => {
    // 全屏
    if (!publicStore.isFullscreen && document.documentElement?.requestFullscreen) {
      document.documentElement.requestFullscreen();
      publicStore.setFullscreen(true);
      return true;
    }
    // 退出全屏
    if (publicStore.isFullscreen && document?.exitFullscreen) {
      document.exitFullscreen();
      publicStore.setFullscreen(false);
      return true;
    }
  };

  return { isFullscreen: publicStore.isFullscreen, toggleFullscreen };
}
