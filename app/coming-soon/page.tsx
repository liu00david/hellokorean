"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ComingSoonPage() {
  const router = useRouter();

  const handleGoBack = () => {
    // Try to go back in history, fallback to homepage after a short delay
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="text-8xl mb-6">🌱</div>

          {/* Heading */}
          <h1 className="text-5xl font-bold mb-4 text-garden-earth">
            Coming Soon
          </h1>

          {/* Description */}
          <p className="text-xl text-garden-earth/70 mb-8">
            This feature is currently being developed and will be available soon!
          </p>

          {/* Back Button */}
          <Button variant="default" size="lg" onClick={handleGoBack}>
            ← Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
