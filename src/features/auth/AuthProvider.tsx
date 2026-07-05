import { createContext, useContext, type PropsWithChildren } from 'react';

export type AuthUser = {
  id: string;
  firstName: string;
  email: string;
};

export type AuthState = {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

/**
 * Auth architecture only — real Supabase auth arrives in a later sprint.
 * The provider always reports a signed-in mock user so the (vita) shell
 * renders. Enabling real auth means replacing the internals of this file
 * (Supabase session listener + real signIn/signOut); consumers of useAuth()
 * and the routing gate in src/app/index.tsx stay unchanged.
 */
const MOCK_USER: AuthUser = {
  id: 'mock-user',
  firstName: 'Wilber',
  email: 'wilber@vita.app',
};

const AuthContext = createContext<AuthState>({
  status: 'signedIn',
  user: MOCK_USER,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const value: AuthState = {
    status: 'signedIn',
    user: MOCK_USER,
    signIn: async () => {},
    signOut: async () => {},
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
