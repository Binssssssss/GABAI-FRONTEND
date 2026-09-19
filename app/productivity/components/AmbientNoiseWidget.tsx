import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AmbientSound } from '../types';
import { AMBIENT_SOUNDS } from '../constants/focusConfig';
import { focusStyles as styles } from '../styles/focus.styles';

interface AmbientNoiseWidgetProps {
  ambientSound: AmbientSound;
  onSelectAmbientSound: (sound: AmbientSound) => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
}

export default function AmbientNoiseWidget({
  ambientSound,
  onSelectAmbientSound,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryAccent,
}: AmbientNoiseWidgetProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionTitle, { color: textSecondary }]}>Ambient Study Audio</Text>
      <View style={styles.ambientRow}>
        {AMBIENT_SOUNDS.map((sound) => {
          const isSelected = ambientSound === sound.id;
          return (
            <TouchableOpacity
              key={sound.id}
              onPress={() => onSelectAmbientSound(sound.id)}
              style={[
                styles.ambientBtn,
                {
                  backgroundColor: isSelected ? primaryAccent : cardBg,
                  borderColor: isSelected ? primaryAccent : borderCol,
                },
              ]}
            >
              <Feather
                name={sound.icon as any}
                size={14}
                color={isSelected ? '#FFFFFF' : textSecondary}
              />
              <Text
                style={[
                  styles.ambientBtnText,
                  { color: isSelected ? '#FFFFFF' : textPrimary },
                ]}
              >
                {sound.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
