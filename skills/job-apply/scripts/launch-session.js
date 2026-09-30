import { chromium } from 'playwright';

/**
 * Launches real installed Chrome using the user's selected profile so the
 * session is already logged in to whatever sites the user normally uses.
 * This script never reads, stores, or types credentials. If a site is not
 * already logged in, the browser window is left open for the human to log
 * in by hand; the script only polls for a URL/selector change to know when
 * to continue.
 */
export async function launchWithProfile({ userDataDir, profileFolder, headless = false }) {
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless,
    args: [`--profile-directory=${profileFolder}`],
    viewport: null,
  });
  return context;
}

export async function waitForManualLogin(page, { checkSelector, checkUrlIncludes, timeoutMs = 10 * 60 * 1000 }) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (checkUrlIncludes && page.url().includes(checkUrlIncludes)) return true;
    if (checkSelector) {
      const found = await page.$(checkSelector).catch(() => null);
      if (found) return true;
    }
    await page.waitForTimeout(2000);
  }
  return false;
}
