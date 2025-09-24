import type { MobileGuardType } from "./MobileGuardType";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Hook for safe-area insets
function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const el = document.documentElement;
    const readInset = (prop: string) =>
      parseInt(getComputedStyle(el).getPropertyValue(prop)) || 0;

    const update = () => {
      setInsets({
        top: readInset("--sat"), // Safari defines env(safe-area-inset-top) → var(--sat)
        bottom: readInset("--sab"),
        left: readInset("--sal"),
        right: readInset("--sar"),
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return insets;
}

export function MobileGuard({
  children,
  spacesFromEdges = { top: 18, bottom: 18, left: 18, right: 18 },
}: MobileGuardType) {
  const [isMobile, setIsMobile] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 430);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Mobile Only</h1>
          <p className="text-muted-foreground">
            Please use a mobile device or resize your browser to continue.
          </p>
        </div>
      </div>
    );
  }

  // Merge user spacing with safe area insets
  const paddingStyle = {
    paddingTop: `${spacesFromEdges.top + insets.top}px`,
    paddingBottom: `${spacesFromEdges.bottom + insets.bottom}px`,
    paddingLeft: `${spacesFromEdges.left + insets.left}px`,
    paddingRight: `${spacesFromEdges.right + insets.right}px`,
  };

  return (
    <div
      className={cn(
        "max-w-[430px] min-h-[100dvh] bg-background text-foreground mx-auto w-full"
      )}
      style={paddingStyle}
    >
      {children}
    </div>
  );
}
