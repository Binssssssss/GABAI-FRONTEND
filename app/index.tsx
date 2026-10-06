import { Redirect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import AnimatedLogoIntro from '@/components/launch/AnimatedLogoIntro';

export default function Index() {
  const { session, isLoading } = useAuth();
  const [showLaunch, setShowLaunch] = useState(true);

  const handleLaunchFinish = useCallback(() => {
    setShowLaunch(false);
  }, []);

  if (isLoading || showLaunch) {
    return <AnimatedLogoIntro onFinish={handleLaunchFinish} />;
  }

  return (
    <Redirect
      href={session ? '/(tabs)/dashboard/dashboard' : '/(auth)/login/login'}
    />
  );
}
