/**
 * Time helpers so the whole app shows 12-hour time (4:00 PM),
 * not military time (16:00). Times are still saved as "HH:MM".
 */

const pad2 = (value: number) => String(value).padStart(2, '0');

/**
 * "16:00" -> "4:00 PM", "08:30" -> "8:30 AM", "00:15" -> "12:15 AM".
 * Text that already has AM/PM, or isn't a time, is returned unchanged.
 */
export function formatTime12(time?: string | null): string {
  if (!time) return '';

  const value = String(time).trim();
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return value;

  const hours = Number(match[1]);
  if (hours > 23) return value;

  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`;
}

/** "13:00" -> "1 PM" (for hour labels on a timeline). */
export function formatHourLabel(time: string): string {
  const match = String(time).match(/^(\d{1,2}):/);
  if (!match) return time;

  const hours = Number(match[1]);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12} ${hours >= 12 ? 'PM' : 'AM'}`;
}

/** A Date's clock time in 12-hour form, whatever the phone's setting: "4:05 PM". */
export function formatClock(date: Date): string {
  return formatTime12(`${pad2(date.getHours())}:${pad2(date.getMinutes())}`);
}

/**
 * What a user typed -> "HH:MM" for saving.
 * Accepts "2:00 PM", "2 pm", "2:30pm" and also "14:00".
 * Returns null when it isn't a valid time.
 */
export function toTime24(input: string): string | null {
  const value = String(input).trim().toUpperCase().replace(/\./g, '');
  const match = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? '0');
  const period = match[3];

  if (minutes > 59) return null;

  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else if (hours > 23) {
    return null;
  }

  return `${pad2(hours)}:${pad2(minutes)}`;
}
