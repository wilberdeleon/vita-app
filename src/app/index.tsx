import { Redirect } from 'expo-router';
import { useAuth } from '../features/auth/AuthProvider';

/**
 * Auth gate. With mock auth the user is always signed in; when real
 * authentication is enabled this routing logic already does the right thing.
 */
export default function Index() {
  const { status } = useAuth();

  if (status === 'signedOut') {
    return <Redirect href="/sign-in" />;
  }
  return <Redirect href="/dashboard" />;
}
