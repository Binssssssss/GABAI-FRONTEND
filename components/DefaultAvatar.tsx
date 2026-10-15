import { Text, View } from 'react-native';

/**
 * The one profile picture every GabAi user gets:
 * their initials on a solid brown circle.
 * Users can't upload their own photo.
 */
interface DefaultAvatarProps {
  /** User's name; the initials come from the first and last word. */
  name?: string;
  size?: number;
}

const ACCENT_BROWN = '#A97C50';

// "Gabai Capstone" -> "GC", "Arjay" -> "A", email -> first letter.
const getInitials = (name?: string) => {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'U';
  if (words.length === 1 || words[0].includes('@')) {
    return words[0][0].toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function DefaultAvatar({ name, size = 44 }: DefaultAvatarProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Profile picture"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: ACCENT_BROWN,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: Math.round(size * 0.375),
          fontWeight: '800',
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
