import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import { assistantStyles as styles } from '../styles';
import { formatTimerTime } from '../utils';

interface FocusSessionWidgetProps {
  onComplete: (duration: number) => void;
  topic?: string;
}

export function FocusSessionWidget({
  onComplete,
  topic = 'Capstone methodology draft review',
}: FocusSessionWidgetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryBrown = '#A97C50';
  const textPrimary = isDark ? '#ECEDEE' : '#11181C';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderCol = isDark ? '#2E2E2E' : '#E2E8F0';

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored if haptics fail or on web
    }
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignored if haptics fail or on web
    }
    onComplete(seconds);
  };

  return (
    <View style={[styles.widgetCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
      <View style={styles.widgetHeader}>
        <Feather name="target" size={16} color={primaryBrown} style={{ marginRight: 6 }} />
        <Text style={[styles.widgetTitle, { color: textPrimary }]}>Focus Stopwatch Active</Text>
      </View>
      <Text style={[styles.widgetSubtitle, { color: isDark ? '#9BA1A6' : '#666' }]}>{topic}</Text>

      <Text style={[styles.timerText, { color: textPrimary }]}>{formatTimerTime(seconds)}</Text>

      <View style={styles.timerControls}>
        <TouchableOpacity
          style={[styles.timerBtn, { borderColor: borderCol }]}
          onPress={toggleTimer}
        >
          <Feather
            name={isRunning ? 'pause' : 'play'}
            size={14}
            color={primaryBrown}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.timerBtnText, { color: textPrimary }]}>
            {isRunning ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timerBtn, { backgroundColor: primaryBrown, borderColor: primaryBrown }]}
          onPress={handleStop}
        >
          <Feather name="check" size={14} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={[styles.timerBtnText, { color: '#FFF' }]}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
