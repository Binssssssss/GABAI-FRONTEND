import * as Haptics from 'expo-haptics';

export const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    Haptics.impactAsync(style);
  } catch {
    // Ignored on web/unsupported
  }
};

export const formatNoteDate = (timestamp: number): string => {
  const noteDate = new Date(timestamp);
  const now = new Date();

  // If today
  if (noteDate.toDateString() === now.toDateString()) {
    return noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // If this year
  if (noteDate.getFullYear() === now.getFullYear()) {
    return noteDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return noteDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
};

export const cleanMarkdownSnippet = (content: string, maxLen = 120): string => {
  if (!content) return '';
  const cleaned = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[\s*\]/g, '☐') // Replace empty checkboxes
    .replace(/\[x\]/gi, '☑') // Replace checked boxes
    .replace(/[*_~`>]/g, '') // Remove markdown symbols
    .trim();

  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen).trim() + '...';
};

export const countWords = (text: string): { words: number; chars: number } => {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = text.length;
  return { words, chars };
};
