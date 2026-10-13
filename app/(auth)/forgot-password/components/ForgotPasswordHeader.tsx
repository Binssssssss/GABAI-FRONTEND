
import { Feather } from '@expo/vector-icons';
import { Image, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/app/context/ThemeContext';
import { forgotPasswordStyles as styles } from '../styles';

interface ForgotPasswordHeaderProps {
  onBack: () => void;
  textPrimary: string;
  primaryBrown: string;
}

export default function ForgotPasswordHeader({
  onBack,
  textPrimary,
}: ForgotPasswordHeaderProps) {
  const { colorScheme } = useAppTheme();

  const logoSource =
    colorScheme === 'dark'
      ? require('@/assets/images/GABAI-LOGO-WHITE.png')
      : require('@/assets/images/GABAI-LOGO-BLACK.png');

  return (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather
          name="arrow-left"
          size={24}
          color={textPrimary}
        />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image
          source={logoSource}
          style={{
            width: 180,
            height: 72,
            alignSelf: 'center',
          }}
          resizeMode="contain"
          accessibilityLabel="GabAi logo"
        />
      </View>
    </>
  );
}
