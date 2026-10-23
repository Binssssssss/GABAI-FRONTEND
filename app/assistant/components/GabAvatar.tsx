import React from 'react';
import { Image, View } from 'react-native';

// Gab, GabAi's study buddy character.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GAB_IMAGE = require('../../../assets/images/gab.png');

interface GabAvatarProps {
  size?: number;
  backgroundColor?: string;
}

export function GabAvatar({ size = 32, backgroundColor = '#2A2017' }: GabAvatarProps) {
  return (
    <View
      accessibilityLabel="Gab"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Image
        source={GAB_IMAGE}
        style={{ width: size * 0.92, height: size * 0.92 }}
        resizeMode="contain"
      />
    </View>
  );
}
