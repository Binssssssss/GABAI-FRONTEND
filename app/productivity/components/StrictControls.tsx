import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { focusStyles as styles } from '../styles/focus.styles';

interface StrictControlsProps {
  isRunning: boolean;
  isPaused: boolean;
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
  textPrimary,
  textSecondary,
  primaryAccent,
}: StrictControlsProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      {/* Primary Action Buttons */}
      <View style={styles.primaryControlsRow}>
        {/* Reset / Stop Button */}
        <TouchableOpacity
          style={[styles.controlSecondaryBtn, { borderColor: borderCol, backgroundColor: cardBg }]}
          onPress={onReset}
        >
          <Feather name="rotate-ccw" size={18} color={textSecondary} />
        </TouchableOpacity>

        {/* Main Play / Pause / Resume Button */}
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.controlMainBtn, { backgroundColor: primaryAccent }]}
            onPress={onStart}
          >
            <Feather name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        ) : isPaused ? (
          <TouchableOpacity
            style={[styles.controlMainBtn, { backgroundColor: primaryAccent }]}
            onPress={onResume}
          >
            <Feather name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlMainBtn, { backgroundColor: '#EF4444' }]}
            onPress={onPause}
          >
            <Feather name="pause" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Finish Early Button */}
        <TouchableOpacity
          style={[styles.controlSecondaryBtn, { borderColor: borderCol, backgroundColor: cardBg }]}
          onPress={onFinishEarly}
        >
          <Feather name="check" size={20} color={textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Strict Mode Toggle Switch */}
      <View style={[styles.strictToggleRow, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <View style={styles.strictToggleLeft}>
          <Text style={[styles.strictToggleTitle, { color: textPrimary }]}>
            🛡️ Strict Study Guard
          </Text>
          <Text style={[styles.strictToggleSub, { color: textSecondary }]}>
            Enforces strict focus. Pausing or leaving requires confirmation and penalizes focus streak.
          </Text>
        </View>
        <Switch
          value={isStrict}
          onValueChange={onToggleStrict}
          trackColor={{ false: borderCol, true: primaryAccent }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
