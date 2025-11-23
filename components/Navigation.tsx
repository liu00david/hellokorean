"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/training/flashcards", label: "Training" },
  { href: "/quiz", label: "Quiz" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleSignIn = async () => {
    setLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      setLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="font-nunito font-bold text-xl text-garden-earth">
              Hangeul Garden
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg font-nunito transition-colors",
                    isActive
                      ? "bg-garden-pink text-garden-earth font-semibold"
                      : "text-garden-earth/70 hover:bg-garden-mint/20 hover:text-garden-earth"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="text-sm text-garden-earth/50">...</div>
            ) : user ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    {user.user_metadata?.avatar_url && (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="hidden sm:inline">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSignIn}
                disabled={loggingIn}
                className="gap-2"
              >
                {loggingIn ? "Signing in..." : "Sign in with Google"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
