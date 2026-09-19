import { Redirect } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';

export default function Index() {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Redirect
      href={session ? '/(tabs)/dashboard/dashboard' : '/(auth)/login/login'}
    />
  );
}
