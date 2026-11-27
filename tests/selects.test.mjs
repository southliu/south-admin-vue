import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoader } from './helpers/load-module.mjs';

for (const name of ['ApiSelect', 'ApiTreeSelect', 'ApiPageSelect']) {
  test(`${name} 参数切换后丢弃旧响应，卸载后不再请求`, async () => {
    const requests = [];
    const changes = [];
    const unmount = [];
    const props = { value: 'selected', params: { query: 'old' }, api: () => {
      const pending = Promise.withResolvers();
      requests.push(pending);
      return pending.promise;
    } };
    const { getApiData, options } = createLoader({
      'test-props': props,
      vue: {
        ref: (value) => ({ value }), computed: (fn) => ({ get value() { return fn(); } }),
        watch: (_source, callback) => changes.push(callback), onMounted() {},
        onBeforeUnmount: (callback) => unmount.push(callback),
      },
      'ant-design-vue': {}, 'vue-i18n': { useI18n: () => ({ t: (key) => key }) },
      '@vueuse/core': { useDebounceFn: (fn) => fn }, './index': { MAX_TAG_COUNT: 5 },
    }, (source) => {
      if (!source.startsWith('<script')) return source;
      return "const defineProps = () => require('test-props'); const defineOptions = () => {};\n"
        + source.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
        + '\nexport { getApiData, options };';
    })(`src/components/Selects/${name}.vue`);
    const first = getApiData();
    props.params = { query: 'new' };
    changes[0]();
    requests[0].resolve({ code: 200, data: [{ label: 'old', value: 1 }] });
    await first;
    assert.deepEqual(options.value, []);
    requests[1].resolve({ code: 200, data: [{ label: 'new', value: 2 }] });
    await new Promise(setImmediate);
    assert.equal(options.value[0].label, 'new');
    unmount[0]();
    await getApiData();
    assert.equal(requests.length, 2);
  });
}
