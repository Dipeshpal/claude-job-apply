import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

function chromeUserDataDir() {
  const plat = process.platform;
  const home = os.homedir();
  if (plat === 'win32') {
    return path.join(process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'), 'Google', 'Chrome', 'User Data');
  }
  if (plat === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Google', 'Chrome');
  }
  return path.join(home, '.config', 'google-chrome');
}

export function listChromeProfiles() {
  const dir = chromeUserDataDir();
  const localStatePath = path.join(dir, 'Local State');
  if (!fs.existsSync(localStatePath)) {
    return { userDataDir: dir, profiles: [], error: 'Chrome not found at expected path' };
  }
  const localState = JSON.parse(fs.readFileSync(localStatePath, 'utf-8'));
  const infoCache = localState.profile?.info_cache || {};
  const profiles = Object.entries(infoCache).map(([folderName, info]) => ({
    folderName,
    displayName: info.name || info.user_name || folderName,
    email: info.user_name || null,
  }));
  return { userDataDir: dir, profiles };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = listChromeProfiles();
  console.log(JSON.stringify(result, null, 2));
}
