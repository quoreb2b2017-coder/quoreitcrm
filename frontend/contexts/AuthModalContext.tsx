'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type AuthModalContextValue = {
  loginOpen: boolean;
  signupOpen: boolean;
  openLogin: () => void;
  openSignup: () => void;
  closeLogin: () => void;
  closeSignup: () => void;
  closeAll: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const openLogin = useCallback(() => {
    setSignupOpen(false);
    setLoginOpen(true);
  }, []);

  const openSignup = useCallback(() => {
    setLoginOpen(false);
    setSignupOpen(true);
  }, []);

  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const closeSignup = useCallback(() => setSignupOpen(false), []);
  const closeAll = useCallback(() => {
    setLoginOpen(false);
    setSignupOpen(false);
  }, []);

  const value: AuthModalContextValue = {
    loginOpen,
    signupOpen,
    openLogin,
    openSignup,
    closeLogin,
    closeSignup,
    closeAll,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  return ctx;
}
