// test/lib/waip.mjs — load the site's classic scripts (core.js, the registry,
// country modules) into this node process, exactly as the browser would run
// them. Shared by every checker and test/run_all.mjs.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const run = rel => vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });

// The registry array from countries/index.js (loaded once per process).
export function loadRegistry() {
  if (!(globalThis.WAIP && globalThis.WAIP.registry)) run('countries/index.js');
  return globalThis.WAIP.registry;
}

// Load core + registry + the given country modules (default: all registered)
// and return the WAIP global.
export function loadWAIP(codes) {
  const registry = loadRegistry();
  run('core.js');
  const want = codes || registry.map(e => e.code);
  for (const code of want) {
    const entry = registry.find(e => e.code === code);
    if (!entry) throw new Error(`country '${code}' is not listed in countries/index.js`);
    run(entry.module);
  }
  return globalThis.WAIP;
}
