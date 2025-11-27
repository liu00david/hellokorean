"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAdminWithClient } from "@/lib/admin";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Set a timeout to ensure loading doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      if (loading && !initialized) {
        console.warn('Auth loading timeout - forcing completion');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000); // 5 second timeout

    // Check active sessions and sets the user (INITIAL LOAD ONLY)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Check if user is admin (with error handling)
      if (currentUser) {
        try {
          const adminStatus = await isAdminWithClient(supabase, currentUser.id);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.warn('Failed to check admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
      setInitialized(true);
      clearTimeout(loadingTimeout);
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
      setInitialized(true);
      clearTimeout(loadingTimeout);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event);

      // Don't show loading spinner for auth changes after initial load
      // This prevents other tabs from disrupting this tab's UI
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Check if user is admin (with error handling)
      if (currentUser) {
        try {
          const adminStatus = await isAdminWithClient(supabase, currentUser.id);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.warn('Failed to check admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      // Only set loading false if we haven't initialized yet
      // This handles the edge case where auth state change happens before initial load completes
      if (!initialized) {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
