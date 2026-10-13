import * as Haptics from 'expo-haptics';

export const triggerHaptic = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) => {
  try {
    void Haptics.impactAsync(style);
  } catch {
    // Ignored on web/unsupported platforms
  }
};

export const triggerSuccessHaptic = () => {
  try {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );
  } catch {
    // Ignored on web/unsupported platforms
  }
};

export const formatNoteDate = (timestamp: number): string => {
  const noteDate = new Date(timestamp);
  const now = new Date();

  // If today
  if (noteDate.toDateString() === now.toDateString()) {
    return noteDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // If this year
  if (noteDate.getFullYear() === now.getFullYear()) {
    return noteDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }

  return noteDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
};

export const cleanMarkdownSnippet = (
  content: string,
  maxLen = 120,
): string => {
  if (!content) return '';

  const cleaned = content
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')

    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, '')

    // Replace unchecked checkboxes
    .replace(/\[\s*\]/g, '☐')

    // Replace checked checkboxes
    .replace(/\[[xX]\]/g, '☑')

    // Remove common markdown symbols
    .replace(/[*_~`>]/g, '')

    .trim();

  if (cleaned.length <= maxLen) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLen).trim()}...`;
};

export const countWords = (
  text: string,
): { words: number; chars: number } => {
  const trimmed = text.trim();

  const words = trimmed
    ? trimmed.split(/\s+/).length
    : 0;

  const chars = text.length;

  return {
    words,
    chars,
  };
};