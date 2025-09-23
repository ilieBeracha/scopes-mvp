import type { MobileGuardType } from "./MobileGuardType";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function MobileGuard({
  children,
  spacesFromEdges = { top: 18, bottom: 18, left: 18, right: 18 },
}: MobileGuardType) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 430);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center  bg-background text-foreground">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Mobile Only</h1>
          <p className="text-muted-foreground">
            Please use a mobile device or resize your browser to continue.
          </p>
        </div>
      </div>
    );
  }

  // Use inline styles for dynamic padding since Tailwind requires static classes
  const paddingStyle = {
    paddingTop: `${spacesFromEdges.top}px`,
    paddingBottom: `${spacesFromEdges.bottom}px`,
    paddingLeft: `${spacesFromEdges.left}px`,
    paddingRight: `${spacesFromEdges.right}px`,
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
