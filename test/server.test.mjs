import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listen, HOST, VERSION } from '../server/serve.mjs';

const script = fileURLToPath(new URL('../server/serve.mjs', import.meta.url));

test('--help and --version work', () => {
  const help = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage/);
  const ver = spawnSync(process.execPath, [script, '--version'], { encoding: 'utf8' });
  assert.equal(ver.stdout.trim(), VERSION);
});

test('serves two files, 404 and 405, on 127.0.0.1', async () => {
  const server = await listen(0);
  try {
    assert.equal(server.address().address, HOST);
    const base = `http://${HOST}:${server.address().port}`;
    const html = await fetch(`${base}/`);
    assert.equal(html.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.match(await html.text(), /Not implemented yet: see #2/);
    const css = await fetch(`${base}/tokens.css`);
    assert.equal(css.headers.get('content-type'), 'text/css; charset=utf-8');
    await css.arrayBuffer();
    for (const path of ['/package.json', '//', '//x/tokens.css']) {
      assert.equal((await fetch(base + path)).status, 404, path);
    }
    assert.equal((await fetch(`${base}/`, { method: 'POST' })).status, 405);
  } finally {
    server.close();
  }
});
