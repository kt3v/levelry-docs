import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { normalizeAppId } from './registered-app-id.mjs';

const mode = process.argv[2];
if (!['--private', '--draft', '--submission'].includes(mode)) throw new Error('Use --private for the registered personal plugin, --draft for a public upload draft, or --submission after live QA and review materials are ready.');
const isPrivate = mode === '--private';
const root = fileURLToPath(new URL('../plugins/levelry/', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'plugin.json'), 'utf8'));
const extension = manifest.extensions['com.openai'];
const presentation = extension.interface;
const missing = [];
for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
  if (!presentation[key] || new URL(presentation[key]).protocol !== 'https:') missing.push(key);
}
if (!extension.review?.demo_recording_url) missing.push('review.demo_recording_url');
if (extension.review?.test_cases?.positive?.length !== 5 || extension.review?.test_cases?.negative?.length !== 3) missing.push('five positive and three negative review cases');
if (presentation.shortDescription.length > 30) throw new Error('Public shortDescription must be at most 30 characters.');
if (mode === '--submission' && missing.length) throw new Error(`Submission materials missing: ${missing.join(', ')}`);
if (isPrivate) {
  if (extension.apps !== './.app.json') throw new Error('Register the ChatGPT MCP app before creating a private package.');
  const apps = JSON.parse(await readFile(path.join(root, '.app.json'), 'utf8'));
  if (normalizeAppId(apps.apps?.levelry?.id) !== apps.apps.levelry.id) throw new Error('Expected a canonical registered app ID.');
}

// Registered ChatGPT app references are for local testing and are rejected by
// the public upload flow. Keep the private source intact and sanitize a copy.
if (!isPrivate) delete extension.apps;
const staging = await mkdtemp(path.join(tmpdir(), 'levelry-plugin-'));
const outputDir = fileURLToPath(new URL('../releases/', import.meta.url));
const archive = path.join(outputDir, `levelry-plugin-${manifest.version}${isPrivate ? '-private' : mode === '--draft' ? '-draft' : ''}.zip`);
try {
  await cp(root, staging, { recursive: true, filter: source => path.basename(source) !== '.DS_Store' && (isPrivate || path.basename(source) !== '.app.json') });
  await writeFile(path.join(staging, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
  await mkdir(outputDir, { recursive: true });
  await rm(archive, { force: true });
  const result = spawnSync('zip', ['-qr', archive, ...(await readdir(staging)).sort()], { cwd: staging, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || 'ZIP creation failed');
  console.log(archive);
  if (isPrivate) console.log('Private package includes the registered ChatGPT app mapping; use it for personal/workspace testing.');
  else {
    if (missing.length) console.log(`Draft only; complete before review: ${missing.join(', ')}`);
    console.log('Live ChatGPT QA, reviewer account, domain verification, and policy attestations must be completed separately.');
  }
} finally {
  await rm(staging, { recursive: true, force: true });
}
