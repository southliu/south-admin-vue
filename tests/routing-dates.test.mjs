import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoader } from './helpers/load-module.mjs';

test('日期区间两端都转换，支持秒级时间戳', () => {
  const { stringRang2DayjsRang } = createLoader({ '@/utils/config': {} })(
    'src/components/Dates/utils/helper.ts',
  );
  const result = stringRang2DayjsRang(['2026-11-01', '2026-11-27']);
  assert.deepEqual(
    result.map((date) => date.format('YYYY-MM-DD')),
    ['2026-11-01', '2026-11-27'],
  );
  assert.equal(stringRang2DayjsRang([1, 2])[1].unix(), 2);
});

test('History 登录跳转保留完整 query，忘记密码可匿名访问', async () => {
  const { routerIntercept } = createLoader({
    '@/stores/public': { usePublicStore: () => ({}) },
    nprogress: { configure() {}, start() {}, done() {} },
    '@/hooks/useToken': { useToken: () => ({ getToken: () => '' }) },
  })('src/router/utils/intercept.ts');
  let guard;
  routerIntercept({
    beforeEach(fn) {
      guard = fn;
    },
    afterEach() {},
    onError() {},
  });
  let destination;
  await guard(
    { path: '/system/user', fullPath: '/system/user?name=a&role=b' },
    {},
    (value) => {
      destination = value;
    },
  );
  assert.equal(
    new URL(destination, 'https://example.test').searchParams.get('redirect'),
    '/system/user?name=a&role=b',
  );
  destination = 'unchanged';
  await guard({ path: '/forget' }, {}, (value) => {
    destination = value;
  });
  assert.equal(destination, undefined);
});


test('密码与长文本按 UTF-8 字节验证边界', async () => {
  const { utf8ByteRule } = createLoader()('src/utils/fieldLimits.ts');
  const t = (_key, { max }) => String(max);
  for (const limit of [72, 65535]) {
    await utf8ByteRule(t, limit).validator(null, '中'.repeat(Math.floor(limit / 3)));
    await assert.rejects(utf8ByteRule(t, limit).validator(null, '中'.repeat(Math.floor(limit / 3) + 1)), new RegExp(String(limit)));
  }
});
