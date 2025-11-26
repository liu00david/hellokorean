"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/quiz", label: "Quiz" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [loggingIn, setLoggingIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      showToast("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      showToast("Failed to sign out", "error");
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

          {/* Desktop Navigation Links */}
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
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "px-4 py-2 rounded-lg font-nunito transition-colors",
                  pathname === "/admin"
                    ? "bg-purple-500 text-white font-semibold"
                    : "text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>

          {/* Auth Buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <Button
                variant="default"
                size="sm"
                disabled
                className="gap-2 opacity-50 min-w-[160px]"
              >
                Sign in with Google
              </Button>
            ) : user ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    {user.user_metadata?.avatar_url && (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        width={24}
                        height={24}
                        className="rounded-full"
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

        {/* Mobile Navigation Links (dropdown menu) */}
        <div className={cn(
          "md:hidden",
          mobileMenuOpen ? "block pb-4 border-t pt-4 mt-2" : "hidden"
        )}>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
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
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2 rounded-lg font-nunito transition-colors",
                  pathname === "/admin"
                    ? "bg-purple-500 text-white font-semibold"
                    : "text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                )}
              >
                Admin
              </Link>
            )}

            {/* Auth Buttons (mobile) */}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t">
              {loading ? (
                <Button
                  variant="default"
                  size="sm"
                  disabled
                  className="w-full gap-2 opacity-50"
                >
                  Sign in with Google
                </Button>
              ) : user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                      {user.user_metadata?.avatar_url && (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span>
                        {user.user_metadata?.name || user.email}
                      </span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
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
                  className="w-full gap-2"
                >
                  {loggingIn ? "Signing in..." : "Sign in with Google"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
