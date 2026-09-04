import { ref } from 'vue';

/**
 * 剪切板
 */
export function useClipboard() {
  const isCopied = ref(false);
  const error = ref('');
  let timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 复制文本
   * @param text - 文本值
   */
  const copyText = async (text: string): Promise<boolean> => {
    try {
      // 现代Clipboard API
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        isCopied.value = true;
        startResetTimer();
        return true;
      }

      // 兼容旧浏览器的execCommand方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed'; // 避免滚动
      document.body.appendChild(textArea);
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (success) {
        isCopied.value = true;
        startResetTimer();
        return true;
      }

      throw new Error('复制失败，请手动复制');
    } catch (err) {
      error.value = err instanceof Error ? err.message : '复制操作被拒绝';
      isCopied.value = false;
      return false;
    }
  };

  /** 定时重置复制状态 */
  const startResetTimer = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      isCopied.value = false;
    }, 1000);
  };

  return { isCopied, error, copyText };
}
