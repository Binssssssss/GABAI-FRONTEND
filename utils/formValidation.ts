/**
 * Shared input rules used by the forms across GabAi.
 * Each check returns an error message, or '' when the value is fine.
 */

export const LIMITS = {
  nameMin: 2,
  nameMax: 50,
  passwordMin: 8,
  taskTitleMin: 3,
  taskTitleMax: 100,
  subjectMax: 40,
  taskNoteMax: 500,
  eventTitleMin: 2,
  eventTitleMax: 60,
  eventDetailsMax: 300,
  noteTitleMax: 100,
  tagMax: 24,
  chatMax: 1000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Letters (including accented ones like ñ, é), plus spaces, dots,
// hyphens and apostrophes. Plain ranges, so it works on every JS engine.
const NAME_PATTERN = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'\-]*$/;

/** Collapse inner spaces and trim the ends. */
export const cleanSpaces = (value: string): string =>
  value.trim().replace(/\s+/g, ' ');

export function checkName(value: string): string {
  const name = cleanSpaces(value);
  if (!name) return 'Full name is required';
  if (name.length < LIMITS.nameMin) {
    return `Name must be at least ${LIMITS.nameMin} characters`;
  }
  if (name.length > LIMITS.nameMax) {
    return `Name must be ${LIMITS.nameMax} characters or less`;
  }
  if (!NAME_PATTERN.test(name)) {
    return "Name can only have letters, spaces, . - '";
  }
  return '';
}

export function checkEmail(value: string): string {
  const email = value.trim();
  if (!email) return 'Email address is required';
  if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address';
  return '';
}

/** Parts of the password rule, for the live checklist. */
export function passwordChecks(value: string) {
  return {
    length: value.length >= LIMITS.passwordMin,
    letter: /[A-Za-z\u00C0-\u024F]/.test(value),
    number: /\d/.test(value),
  };
}

/** For NEW passwords (register, change password). */
export function checkNewPassword(value: string): string {
  if (!value) return 'Password is required';
  const checks = passwordChecks(value);
  if (!checks.length || !checks.letter || !checks.number) {
    return `Use at least ${LIMITS.passwordMin} characters with a letter and a number`;
  }
  return '';
}

/** Required text with a min/max length. */
export function checkLength(
  value: string,
  {
    min = 1,
    max,
    empty,
    short,
  }: { min?: number; max: number; empty: string; short?: string },
): string {
  const text = value.trim();
  if (!text) return empty;
  if (text.length < min) return short ?? `Use at least ${min} characters`;
  if (text.length > max) return `Keep it within ${max} characters`;
  return '';
}

/** Optional text that only has a maximum. */
export function checkMax(value: string, max: number): string {
  return value.trim().length > max ? `Keep it within ${max} characters` : '';
}
