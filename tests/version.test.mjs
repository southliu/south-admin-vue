import { createLoader } from './helpers/load-module.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';

test('构建代码和版本文件使用同一个版本', () => {
  const plugin = createLoader()(
    'build/plugins/version.ts',
  ).versionUpdatePlugin();
  const defined = JSON.parse(
    plugin.config().define['import.meta.env.VITE_BUILD_VERSION'],
  );
  let emitted;
  plugin.generateBundle.call({
    emitFile: (asset) => {
      emitted = asset;
    },
  });
  assert.equal(emitted.fileName, 'version.json');
  assert.equal(JSON.parse(emitted.source).version, defined);
});

for (const hashRouter of [false, true]) {
  test(`${hashRouter ? 'HashRouter' : 'BrowserRouter'} 版本参数位置、旧参数迁移、整页刷新和循环保护`, async () => {
    const originalWindow = globalThis.window;
    const originalTimeout = globalThis.setTimeout;
    const timers = [];
    let reloads = 0;
    const href = hashRouter
      ? 'https://example.test/?tenant=one&__app_version=v0#/login?redirect=%2Fconfig%2Frule'
      : 'https://example.test/login?tenant=one&redirect=%2Fconfig%2Frule';
    globalThis.window = {
      location: {
        href,
        replace: (url) => {
          window.location.href = url;
          reloads++;
        },
        reload: () => reloads++,
      },
      history: {
        state: { key: 'preserved' },
        replaceState: (state, title, url) => {
          assert.deepEqual(state, { key: 'preserved' });
          window.location.href = url;
        },
      },
    };
    globalThis.setTimeout = (callback) => timers.push(callback);
    try {
      const page = () =>
        createLoader(
          {
            '@/utils/config': {},
            '@/utils/message': { message: { info() {} } },
            axios: {
              get: async (url) => {
                assert.equal(url, '/console/version.json');
                return { data: { version: 'v2' } };
              },
            },
          },
          (source) =>
            source
              .replaceAll('import.meta.env.MODE', "'production'")
              .replaceAll('import.meta.env.VITE_BUILD_VERSION', "'v1'")
              .replaceAll('import.meta.env.BASE_URL', "'/console/'"),
        )('src/layouts/utils/helper.ts');
      await page().versionCheck((key) => key);
      assert.equal(timers.length, 1);
      timers[0]();
      const target = new URL(window.location.href);
      const route = hashRouter
        ? new URL(target.hash.slice(1), target.origin)
        : target;
      assert.equal(target.searchParams.get('tenant'), 'one');
      assert.equal(target.searchParams.has('__app_version'), !hashRouter);
      assert.equal(route.searchParams.get('__app_version'), 'v2');
      assert.equal(route.searchParams.get('redirect'), '/config/rule');
      assert.equal(reloads, 1);
      await page().versionCheck((key) => key);
      assert.equal(timers.length, 1);
      if (hashRouter) {
        window.location.href =
          'https://example.test/?__app_version=v2#/login?redirect=%2Fconfig%2Frule';
        await page().versionCheck((key) => key);
        assert.equal(
          new URL(window.location.href).searchParams.has('__app_version'),
          false,
        );
        assert.equal(timers.length, 1);
      }
    } finally {
      globalThis.window = originalWindow;
      globalThis.setTimeout = originalTimeout;
    }
  });
}

test('并发检查只发一个请求，非法版本不刷新，轮询可停止', async () => {
  const original = {
    window: globalThis.window,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
  };
  let resolve;
  let requests = 0;
  let interval;
  let stopped;
  globalThis.window = { location: { href: 'https://example.test/login' } };
  globalThis.setInterval = (callback, ms) => {
    assert.equal(ms, 2000);
    interval = callback;
    return 123;
  };
  globalThis.clearInterval = (id) => {
    stopped = id;
  };
  try {
    const helper = createLoader(
      {
        '@/utils/config': {},
        '@/utils/message': {
          message: {
            info() {
              assert.fail('invalid version');
            },
          },
        },
        axios: {
          get: () => {
            requests++;
            return new Promise((done) => {
              resolve = done;
            });
          },
        },
      },
      (source) =>
        source
          .replaceAll('import.meta.env.MODE', "'production'")
          .replaceAll('import.meta.env.VITE_BUILD_VERSION', "'v1'")
          .replaceAll('import.meta.env.BASE_URL', "'/'"),
    )('src/layouts/utils/helper.ts');
    const stop = helper.startVersionCheck((key) => key);
    await helper.versionCheck((key) => key);
    assert.equal(requests, 1);
    resolve({ data: { version: {} } });
    await new Promise(setImmediate);
    interval();
    assert.equal(requests, 2);
    resolve({ data: { version: 'v1' } });
    await new Promise(setImmediate);
    stop();
    assert.equal(stopped, 123);
  } finally {
    Object.assign(globalThis, original);
  }
});
