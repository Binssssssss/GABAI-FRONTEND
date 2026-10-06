import { FontAwesome } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { registerStyles as styles } from '../styles';

interface RegisterSocialProps {
  onGoogleSignup: () => void;
  isLoading: boolean;
  borderColorDefault: string;
  textSecondary: string;
  textPrimary: string;
}

export function RegisterSocial({
  onGoogleSignup,
  isLoading,
  borderColorDefault,
  textSecondary,
  textPrimary,
}: RegisterSocialProps) {
  return (
    <>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: borderColorDefault }]} />
        <Text style={[styles.dividerText, { color: textSecondary }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: borderColorDefault }]} />
      </View>

      {/* Google Signup */}
      <TouchableOpacity
        style={[styles.googleButton, { borderColor: borderColorDefault }]}
        onPress={onGoogleSignup}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <FontAwesome name="google" size={18} color="#4285F4" style={styles.googleIcon} />
        <Text style={[styles.googleButtonText, { color: textPrimary }]}>
          Continue with Google
        </Text>
      </TouchableOpacity>
    </>
  );
}
