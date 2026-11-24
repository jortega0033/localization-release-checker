import { test } from 'node:test';
import assert from 'node:assert/strict';

for (const m of ['catalog', 'message', 'audit', 'preview', 'store', 'report', 'ui', 'fixtures']) {
  test(`app/${m} imports`, async () => {
    assert.ok(await import(`../app/${m}/index.mjs`));
  });
}
