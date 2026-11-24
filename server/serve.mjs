// Static loopback server: serves an allowlist of two files on 127.0.0.1 (see #2).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const HOST = '127.0.0.1';
export const PORT = 8791;
export const VERSION = '0.0.0';

const appDir = new URL('../app/', import.meta.url);
const HTML = ['index.html', 'text/html; charset=utf-8'];
const ALLOWED = new Map([
  ['/', HTML],
  ['/index.html', HTML],
  ['/tokens.css', ['tokens.css', 'text/css; charset=utf-8']],
]);

export const HELP = `Usage: node server/serve.mjs [--help] [--version]
Serves app/index.html and app/tokens.css on http://${HOST}:${PORT}.`;

export function createApp() {
  return createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const entry = ALLOWED.get(req.url.split('?')[0]);
    if (!entry) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    const body = await readFile(new URL(entry[0], appDir));
    res.writeHead(200, { 'Content-Type': entry[1] }).end(req.method === 'HEAD' ? undefined : body);
  });
}

export function listen(port = PORT) {
  return new Promise((resolve, reject) => {
    const server = createApp();
    server.once('error', reject);
    server.listen(port, HOST, () => resolve(server));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [arg] = process.argv.slice(2);
  if (arg === '--help') console.log(HELP);
  else if (arg === '--version') console.log(VERSION);
  else if (arg !== undefined) {
    console.error(`Unknown option: ${arg}\n${HELP}`);
    process.exitCode = 2;
  } else {
    listen().then(
      () => console.log(`Listening on http://${HOST}:${PORT}`),
      (err) => {
        console.error(err.code === 'EADDRINUSE'
          ? `Port ${PORT} on ${HOST} is already in use. The address is fixed; stop the other process.`
          : `Cannot start: ${err.message}`);
        process.exitCode = 1;
      },
    );
  }
}
