import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

/** Red inline message shown under a form field. Renders nothing when empty. */
export default function FieldError({
  message,
  color = '#EF4444',
}: {
  message?: string | null;
  color?: string;
}) {
  if (!message || !message.trim()) return null;

  return (
    <View style={s.row} accessibilityRole="alert">
      <Feather name="alert-circle" size={13} color={color} style={s.icon} />
      <Text style={[s.text, { color }]}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
    marginLeft: 2,
  },
  icon: {
    marginTop: 1.5,
  },
  text: {
    flexShrink: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
});
