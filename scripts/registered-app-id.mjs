const appIdPattern = /^(?:asdk_app_|connector_|templated_apps_)[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

/** Accept a management URL or host-facing ID; store the canonical app ID. */
export function normalizeAppId(input) {
  let id = input;
  if (typeof id === 'string' && id.startsWith('https://')) {
    const url = new URL(id);
    if (url.hostname !== 'chatgpt.com') throw new Error('Expected a ChatGPT connection URL.');
    id = url.pathname.split('/').find(part => /^(?:plugin_)?(?:asdk_app_|connector_|templated_apps_)/.test(part));
  }
  if (typeof id === 'string' && id.startsWith('plugin_asdk_app_')) id = id.slice('plugin_'.length);
  if (typeof id !== 'string' || !appIdPattern.test(id)) throw new Error('Pass the registered ChatGPT MCP app ID (asdk_app_...) or its ChatGPT URL.');
  return id;
}
