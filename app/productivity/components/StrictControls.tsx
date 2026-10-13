
import { Feather } from '@expo/vector-icons';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { focusStyles as styles } from '../styles/focus.styles';

interface StrictControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isFocusLocked: boolean;
  isStrict: boolean;
  onToggleStrict: (val: boolean) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
}

export default function StrictControls({
  isRunning,
  isPaused,
  isStrict,
  onToggleStrict,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinishEarly,
  cardBg,
  borderCol,
  isFocusLocked,
  textPrimary,
  textSecondary,
  primaryAccent,
}: StrictControlsProps) {
  const strictSessionActive = isFocusLocked;

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.primaryControlsRow}>
        {/* Reset is unavailable during Strict Focus */}
        {strictSessionActive ? (
          <View
            accessibilityRole="image"
            accessibilityLabel="Reset unavailable during Strict Focus"
            style={[
              styles.controlSecondaryBtn,
              {
                borderColor: borderCol,
                backgroundColor: cardBg,
                opacity: 0.45,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Feather
              name="shield"
              size={18}
              color={textSecondary}
            />
          </View>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            style={[
              styles.controlSecondaryBtn,
              {
                borderColor: borderCol,
                backgroundColor: cardBg,
              },
            ]}
            onPress={onReset}
          >
            <Feather
              name="rotate-ccw"
              size={18}
              color={textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Main Play / Pause / Resume Button */}
        {!isRunning ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Start focus timer"
            style={[
              styles.controlMainBtn,
              { backgroundColor: primaryAccent },
            ]}
            onPress={onStart}
          >
            <Feather
              name="play"
              size={28}
              color="#FFFFFF"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        ) : isPaused ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Resume focus timer"
            style={[
              styles.controlMainBtn,
              { backgroundColor: primaryAccent },
            ]}
            onPress={onResume}
          >
            <Feather
              name="play"
              size={28}
              color="#FFFFFF"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        ) : strictSessionActive ? (
          <View
            accessibilityRole="image"
            accessibilityLabel="Strict Focus is active"
            style={[
              styles.controlMainBtn,
              {
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: primaryAccent,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Feather
              name="shield"
              size={25}
              color={primaryAccent}
            />
          </View>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Pause focus timer"
            style={[
              styles.controlMainBtn,
              { backgroundColor: '#C97878' },
            ]}
            onPress={onPause}
          >
            <Feather
              name="pause"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}

        {/* Finish Early remains available for confirmed early completion */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Finish focus session early"
          style={[
            styles.controlSecondaryBtn,
            {
              borderColor: borderCol,
              backgroundColor: cardBg,
              opacity: isRunning ? 1 : 0.5,
            },
          ]}
          onPress={onFinishEarly}
        >
          <Feather
            name="check"
            size={20}
            color={textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Strict Mode Toggle */}
      <View
        style={[
          styles.strictToggleRow,
          {
            backgroundColor: cardBg,
            borderColor: borderCol,
          },
        ]}
      >
        <View style={styles.strictToggleLeft}>
          <Text
            style={[
              styles.strictToggleTitle,
              { color: textPrimary },
            ]}
          >
            🛡️ Strict Study Guard
          </Text>

          <Text
            style={[
              styles.strictToggleSub,
              { color: textSecondary },
            ]}
          >
            {strictSessionActive
              ? 'Strict Focus is locked. Pausing, resetting, and changing modes are disabled.'
              : 'Restricts navigation and timer controls while a Strict Focus session is active.'}
          </Text>
        </View>

        <Switch
          value={isStrict}
          onValueChange={onToggleStrict}
          disabled={isRunning || isPaused}
          accessibilityLabel="Strict Study Guard"
          trackColor={{
            false: borderCol,
            true: primaryAccent,
          }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
