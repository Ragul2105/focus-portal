'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { firebaseAuth } from './firebase';
import type { User } from './types';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'ftp_jwt';

export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

export function loadToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const jwt = loadToken();
    if (!jwt) { setLoading(false); return; }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) setUser(mapUser(json.data));
        else removeToken();
      })
      .catch(() => removeToken())
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    // 1. Firebase auth → get ID token
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const firebaseToken = await credential.user.getIdToken();

    // 2. Exchange for our JWT
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? 'Login failed');

    saveToken(json.data.token);
    setUser(mapUser(json.data.user));
  }

  function signOut() {
    firebaseSignOut(firebaseAuth).catch(() => {});
    removeToken();
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Shape mapper ─────────────────────────────────────────────────────────────

function mapUser(raw: Record<string, unknown>): User {
  return {
    id:         String(raw.id ?? ''),
    email:      String(raw.email ?? ''),
    fullName:   String(raw.full_name ?? raw.fullName ?? raw.email ?? ''),
    department: raw.department ? String(raw.department) : undefined,
    phone:      raw.phone ? String(raw.phone) : undefined,
    isActive:   raw.is_active !== false,
    roles:      Array.isArray(raw.roles) ? raw.roles as string[] : [],
  };
}

export type { User };
