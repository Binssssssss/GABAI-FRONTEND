import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FocusSessionWidgetProps {
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function FocusSessionWidget({
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: FocusSessionWidgetProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => router.push('/productivity' as any)}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.icon,
            { backgroundColor: `${primaryBrown}12` },
          ]}
        >
          <Feather
            name="clock"
            size={16}
            color={primaryBrown}
          />
        </View>

        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              { color: textPrimary },
            ]}
          >
            Focus Session
          </Text>

          <Text
            style={[
              styles.target,
              { color: textSecondary },
            ]}
          >
            Start a focused study block
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <View
          style={[
            styles.playButton,
            { backgroundColor: primaryBrown },
          ]}
        >
          <Feather
            name="play"
            size={13}
            color="#FFFFFF"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    marginLeft: 10,
  },

  title: {
    fontSize: 13,
    fontWeight: '700',
  },

  target: {
    fontSize: 11,
    marginTop: 2,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },

  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});