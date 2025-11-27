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

// Cache admin status to avoid repeated database calls
const ADMIN_CACHE_KEY = 'hellokorean_admin_status';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AdminCache {
  userId: string;
  isAdmin: boolean;
  timestamp: number;
}

function getCachedAdminStatus(userId: string): boolean | null {
  // Check if we're in the browser
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(ADMIN_CACHE_KEY);
    if (!cached) return null;

    const data: AdminCache = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;

    if (data.userId === userId && !isExpired) {
      return data.isAdmin;
    }
  } catch (error) {
    console.warn('Error reading admin cache:', error);
  }
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  // Check if we're in the browser
  if (typeof window === 'undefined') return;

  try {
    const data: AdminCache = {
      userId,
      isAdmin,
      timestamp: Date.now()
    };
    localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Error setting admin cache:', error);
  }
}

function clearAdminCache() {
  // Check if we're in the browser
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ADMIN_CACHE_KEY);
  } catch (error) {
    console.warn('Error clearing admin cache:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Helper function to check admin status with caching
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    // Check cache first
    const cached = getCachedAdminStatus(userId);
    if (cached !== null) {
      console.log('Using cached admin status:', cached);
      return cached;
    }

    // Not in cache, query database with timeout
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('Admin status check timed out, assuming false');
          resolve(false);
        }, 3000);
      });

      const adminPromise = isAdminWithClient(supabase, userId);
      const adminStatus = await Promise.race([adminPromise, timeoutPromise]);

      setCachedAdminStatus(userId, adminStatus);
      return adminStatus;
    } catch (error) {
      console.warn('Failed to check admin status:', error);
      return false;
    }
  };

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

      // Check if user is admin (with caching)
      if (currentUser) {
        const adminStatus = await checkAdminStatus(currentUser.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
        clearAdminCache();
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

      // Check if user is admin (with caching)
      if (currentUser) {
        const adminStatus = await checkAdminStatus(currentUser.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
        clearAdminCache();
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
