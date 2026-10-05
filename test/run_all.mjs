// test/run_all.mjs — the whole suite, driven by the registry.
//
// For every country in countries/index.js:
//   1. its module, rates doc (non-empty), extra docs and test/<code>_check.mjs exist
//   2. the module registers and satisfies the contract (test/lib/contract.mjs)
//   3. test/<code>_check.mjs exits 0
// Then the scaffolder's stub module is checked against the same contract, and
// test/dom_check.mjs (real browser) runs once for the whole site.
//
// Run:   node test/run_all.mjs            (everything; what CI runs)
//        node test/run_all.mjs --no-dom   (skip the browser check locally)
// Exits non-zero on any failure. Adding a country needs no change here.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, loadRegistry, loadWAIP } from './lib/waip.mjs';
import { checkContract } from './lib/contract.mjs';

const skipDom = process.argv.includes('--no-dom');
const failures = [];

const nonEmptyFile = rel => {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) && fs.statSync(p).isFile() && fs.statSync(p).size > 0;
};
const runNode = rel => spawnSync(process.execPath, [path.join(ROOT, rel)], { cwd: ROOT, encoding: 'utf8' });

const registry = loadRegistry();
const codes = registry.map(e => e.code);
if (!registry.length) failures.push('registry: countries/index.js lists no countries');
if (new Set(codes).size !== codes.length) failures.push(`registry: duplicate codes in ${codes.join(', ')}`);

loadWAIP([]); // core + registry; modules are loaded one by one below
const WAIP = globalThis.WAIP;

console.log(`countries in registry: ${codes.join(', ')}\n`);
for (const entry of registry) {
  const label = `${entry.code} (${entry.nameEn || entry.name})`;
  const problems = [];
  const checker = `test/${entry.code}_check.mjs`;

  for (const [what, rel] of [['module', entry.module], ['rates doc', entry.ratesDoc], ['checker', checker]]) {
    if (!rel) problems.push(`no ${what} path in the registry`);
    else if (!nonEmptyFile(rel)) problems.push(`${what} ${rel} is missing or empty`);
  }
  for (const rel of entry.docs || []) if (!nonEmptyFile(rel)) problems.push(`doc ${rel} is missing or empty`);

  if (entry.module && nonEmptyFile(entry.module)) {
    try {
      vm.runInThisContext(fs.readFileSync(path.join(ROOT, entry.module), 'utf8'), { filename: entry.module });
      for (const p of checkContract(WAIP.countries[entry.code], entry)) problems.push(`contract: ${p}`);
    } catch (e) {
      problems.push(`module threw while loading: ${e.message}`);
    }
  }

  let summary = 'not run';
  let detail = '';
  if (nonEmptyFile(checker)) {
    const r = runNode(checker);
    const lines = (r.stdout + r.stderr).trim().split('\n');
    summary = lines[lines.length - 1] || '(no output)';
    if (r.status !== 0) {
      problems.push(`${checker} exited ${r.status}`);
      detail = lines.filter(l => !/^ok\b/.test(l)).map(l => '      | ' + l).join('\n');
    }
  }

  if (problems.length) {
    console.log(`FAIL  ${label}`);
    for (const p of problems) console.log(`      - ${p}`);
    if (detail) console.log(detail);
    failures.push(...problems.map(p => `${entry.code}: ${p}`));
  } else {
    console.log(`PASS  ${label}  [ ${entry.ratesDoc} | contract ok | ${checker}: ${summary} ]`);
  }
}

// The scaffolder's stub module must satisfy the same contract, so a new
// country starts from something that loads and renders.
{
  const { renderCountry } = await import('../scripts/new-country.mjs');
  const code = 'zz';
  const stub = renderCountry({ code, name: 'Stub', nameEn: 'Stub', symbol: '¤ ', locale: 'en', year: 2000 });
  let problems;
  WAIP.registry.push(stub.entry);
  try {
    vm.runInThisContext(stub.files[`countries/${code}.js`], { filename: `scaffold:countries/${code}.js` });
    problems = checkContract(WAIP.countries[code], stub.entry);
  } catch (e) {
    problems = [`stub module threw while loading: ${e.message}`];
  } finally {
    WAIP.registry.pop();
    delete WAIP.countries[code];
  }
  if (problems.length) {
    console.log('FAIL  scaffold (scripts/new-country.mjs)');
    for (const p of problems) console.log(`      - contract: ${p}`);
    failures.push(...problems.map(p => `scaffold: contract: ${p}`));
  } else {
    console.log('PASS  scaffold  [ scripts/new-country.mjs stub satisfies the contract ]');
  }
}

if (skipDom) {
  console.log('\nSKIP  test/dom_check.mjs (--no-dom)');
} else {
  console.log('\n--- test/dom_check.mjs ---');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'test/dom_check.mjs')], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) failures.push(`test/dom_check.mjs exited ${r.status}`);
}

if (failures.length) {
  console.log(`\nFAILED (${failures.length}):`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log(`\nALL SUITES PASSED (${codes.length} countries${skipDom ? ', DOM skipped' : ' + DOM'})`);
