import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import AnimatedLogoIntro from '@/components/launch/AnimatedLogoIntro';

export default function Index() {
  const { session, isLoading } = useAuth();
  const [showLaunch, setShowLaunch] = useState(true);

  // null = still checking, true/false = whether onboarding was already shown
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('gabai.onboarding.seen')
      .then((value) => setHasSeenOnboarding(value === 'true'))
      .catch(() => setHasSeenOnboarding(true));
  }, []);

  const handleLaunchFinish = useCallback(() => {
    setShowLaunch(false);
  }, []);

  if (isLoading || showLaunch || hasSeenOnboarding === null) {
    return <AnimatedLogoIntro onFinish={handleLaunchFinish} />;
  }

  // Logged in: go straight to the app.
  if (session) {
    return <Redirect href="/(tabs)/dashboard/dashboard" />;
  }

  // First time: show onboarding. After that: go to login.
  return (
    <Redirect
      href={hasSeenOnboarding ? '/(auth)/login/login' : '/(auth)/onboarding/onboarding'}
    />
  );
}