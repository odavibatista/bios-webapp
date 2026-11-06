// Serve o build dos e2e como a hospedagem serve o site: arquivo que existe, ou `index.html` para as rotas.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist/e2e/browser/', import.meta.url)));
const port = Number(process.argv[2] ?? 4300);
const types = new Map([
  ['.css', 'text/css'],
  ['.html', 'text/html'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript'],
  ['.json', 'application/json'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.woff2', 'font/woff2'],
  ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
]);

createServer(async (request, response) => {
  let path;
  try {
    const url = new URL(request.url ?? '/', `http://localhost:${port}`);
    path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    if (!(await stat(path).catch(() => null))?.isFile()) {
      if (!request.headers.accept?.includes('text/html')) {
        response.writeHead(404).end();
        return;
      }
      path = resolve(root, 'index.html');
    }
  } catch {
    response.writeHead(400).end();
    return;
  }

  response.writeHead(200, {
    'Content-Type': types.get(extname(path)) ?? 'application/octet-stream',
  });
  createReadStream(path).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Servidor e2e em http://127.0.0.1:${port}`);
});
