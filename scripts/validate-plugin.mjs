import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../plugins/levelry/', import.meta.url)));
const read = async name => JSON.parse(await readFile(path.join(root, name), 'utf8'));
const manifest = await read('plugin.json');
const mcp = await read('mcp.json');
const fail = message => { throw new Error(message); };
if (manifest.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') fail('Wrong manifest schema');
if (!/^[a-z0-9-]+$/.test(manifest.name) || !/^\d+\.\d+\.\d+$/.test(manifest.version)) fail('Invalid identity');
const extension = manifest.extensions?.['com.openai'];
if (!extension?.interface?.displayName) fail('Missing presentation metadata');
if (mcp.mcpServers?.levelry?.type !== 'streamable-http' || new URL(mcp.mcpServers.levelry.url).protocol !== 'https:') fail('Expected remote HTTPS MCP transport');
for (const value of [extension.interface.composerIcon, extension.interface.logo, extension.apps].filter(Boolean)) {
  if (!value.startsWith('./') || !path.resolve(root, value).startsWith(root + path.sep)) fail('Asset path escapes the plugin');
  await stat(path.resolve(root, value));
}
if (extension.apps) {
  const apps = await read(extension.apps);
  if (!/^plugin_asdk_app_[a-zA-Z0-9]+$/.test(apps.apps?.levelry?.id ?? '')) fail('Invalid registered MCP ID');
}
const skill = await readFile(path.join(root, 'skills/levelry-mcp/SKILL.md'), 'utf8');
if (!skill.startsWith('---\nname: levelry-mcp\n') || !skill.includes('projectId')) fail('Missing project-aware skill');
const marketplace = JSON.parse(await readFile(new URL('../.agents/plugins/marketplace.json', import.meta.url), 'utf8'));
if (marketplace.plugins[0].source.path !== './plugins/levelry') fail('Wrong local marketplace source');
console.log('Plugin package paths, metadata, MCP transport, skill, and marketplace validated.');
if (!extension.apps) console.log('For private local testing: register the remote MCP connection and run scripts/register-chatgpt.mjs with its technical ID. Public ZIPs must omit this mapping.');
