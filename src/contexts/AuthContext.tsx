import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { email: string } | null;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const BIOMETRIC_KEY = 'biometric_enabled';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    biometricAvailable: false,
    biometricEnabled: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const [token, userJson, biometricPref, hasHardware, isEnrolled] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
          SecureStore.getItemAsync(BIOMETRIC_KEY),
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);

        const biometricAvailable = hasHardware && isEnrolled;
        const biometricEnabled = biometricPref === 'true' && biometricAvailable;

        if (token && userJson) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: JSON.parse(userJson),
            biometricAvailable,
            biometricEnabled,
          });
        } else {
          setState(s => ({
            ...s,
            isLoading: false,
            biometricAvailable,
            biometricEnabled,
          }));
        }
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // In a real app, this would call an API endpoint
    const token = `token_${Date.now()}`;
    const user = { email };

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    setState(s => ({ ...s, isAuthenticated: true, user }));
  }, []);

  const signup = useCallback(async (email: string, _password: string) => {
    // In a real app, this would call an API endpoint
    const token = `token_${Date.now()}`;
    const user = { email };

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    setState(s => ({ ...s, isAuthenticated: true, user }));
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setState(s => ({ ...s, isAuthenticated: false, user: null }));
  }, []);

  const authenticateWithBiometrics = useCallback(async () => {
    if (!state.biometricAvailable) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign in',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      if (userJson) {
        setState(s => ({ ...s, isAuthenticated: true, user: JSON.parse(userJson) }));
        return true;
      }
    }
    return false;
  }, [state.biometricAvailable]);

  const enableBiometrics = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Enable biometric login',
      cancelLabel: 'Cancel',
    });
    if (result.success) {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
      setState(s => ({ ...s, biometricEnabled: true }));
    }
  }, []);

  const disableBiometrics = useCallback(async () => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, 'false');
    setState(s => ({ ...s, biometricEnabled: false }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        authenticateWithBiometrics,
        enableBiometrics,
        disableBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
