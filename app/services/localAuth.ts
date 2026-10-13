import { requireOptionalNativeModule } from 'expo-modules-core';

/**
 * Safe wrapper around expo-local-authentication.
 *
 * The native part of expo-local-authentication only exists in app
 * builds made after the package was installed. Importing it in an
 * older build crashes the whole app, so we check first and load it
 * only when it's really there. Without it, App Lock is simply
 * unavailable instead of crashing.
 */

type LocalAuthModule = typeof import('expo-local-authentication');

let cachedModule: LocalAuthModule | null | undefined;

function getLocalAuth(): LocalAuthModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    if (!requireOptionalNativeModule('ExpoLocalAuthentication')) {
      cachedModule = null;
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-local-authentication') as LocalAuthModule;
  } catch (error) {
    console.warn('Local authentication is not available in this build:', error);
    cachedModule = null;
  }

  return cachedModule;
}

/** True when this app build includes fingerprint / face / PIN support. */
export function isLocalAuthSupported(): boolean {
  return getLocalAuth() !== null;
}

/** True when the phone has a fingerprint, face, PIN or pattern set up. */
export async function hasDeviceLockSetUp(): Promise<boolean> {
  const localAuth = getLocalAuth();

  if (!localAuth) {
    return false;
  }

  try {
    const level = await localAuth.getEnrolledLevelAsync();
    return level !== localAuth.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** Shows the phone's unlock prompt. Resolves true if the user passed. */
export async function authenticateUser(promptMessage: string): Promise<boolean> {
  const localAuth = getLocalAuth();

  if (!localAuth) {
    return false;
  }

  try {
    const result = await localAuth.authenticateAsync({ promptMessage });
    return result.success;
  } catch (error) {
    console.error('Local authentication failed:', error);
    return false;
  }
}
