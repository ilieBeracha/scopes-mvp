"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router";

type IconComponentType = React.ElementType<{ className?: string }>;

export interface MenuDockItem {
  label: string;
  icon: IconComponentType;
  onClick?: () => void;
}

export interface MenuDockProps {
  items?: MenuDockItem[];
  className?: string;
  variant?: "default" | "compact" | "large" | "mini";
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  animated?: boolean;
}

export const MenuDock: React.FC<MenuDockProps> = ({
  items,
  className,
  variant = "default",
  orientation = "horizontal",
  showLabels = true,
  animated = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const finalItems = useMemo(() => {
    // If no items provided, return empty array
    if (!items) {
      return [];
    }

    // If items provided, validate them
    const isValid =
      Array.isArray(items) && items.length >= 2 && items.length <= 8;
    if (!isValid) {
      console.warn(
        "MenuDock: 'items' prop is invalid. Expected array with 2-8 items.",
        items
      );
      return [];
    }
    return items;
  }, [items]);

  // Calculate active index based on current location
  const activeIndex = useMemo(() => {
    if (!finalItems || finalItems.length === 0) {
      return 0;
    }

    const currentPath = location.pathname;
    // Handle exact matches first
    if (currentPath === "/" || currentPath === "/home") {
      return finalItems.findIndex((item) => item.label === "home");
    }

    // For other paths, find the matching item
    const index = finalItems.findIndex((item) => {
      const pathSegment = currentPath.replace("/", "");
      return pathSegment === item.label;
    });

    return index >= 0 ? index : 0; // Default to first item (home)
  }, [location.pathname, finalItems]);
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const [underlineLeft, setUnderlineLeft] = useState(0);

  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updateUnderline = () => {
      const activeButton = itemRefs.current[activeIndex ?? 0];
      const activeText = textRefs.current[activeIndex ?? 0];

      if (
        activeButton &&
        activeText &&
        showLabels &&
        orientation === "horizontal"
      ) {
        const buttonRect = activeButton.getBoundingClientRect();
        const textRect = activeText.getBoundingClientRect();
        const containerRect =
          activeButton.parentElement?.getBoundingClientRect();

        if (containerRect) {
          setUnderlineWidth(textRect.width);
          setUnderlineLeft(
            buttonRect.left -
              containerRect.left +
              (buttonRect.width - textRect.width) / 2
          );
        }
      }
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeIndex, finalItems, showLabels, orientation]);

  const handleItemClick = (item: MenuDockItem) => {
    navigate(`/${item.label}`);
    item.onClick?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "mini":
        return {
          container: "p-0.5",
          item: "p-1.5 min-w-8",
          icon: "h-3.5 w-3.5",
          text: "text-xs",
        };
      case "compact":
        return {
          container: "p-1",
          item: "p-2 min-w-10",
          icon: "h-4 w-4",
          text: "text-xs",
        };
      case "large":
        return {
          container: "p-3",
          item: "p-3 min-w-16",
          icon: "h-6 w-6",
          text: "text-base",
        };
      default:
        return {
          container: "p-2",
          item: "p-2 min-w-14",
          icon: "h-5 w-5",
          text: "text-sm",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <nav
      className={cn(
        "inline-flex absolute bottom-8 items-center bg-sidebar-accent backdrop-blur-md border border-gray-200/50 shadow-lg dark:border-gray-700/50 pointer-events-auto",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        variant === "mini" ? "rounded-lg" : "rounded-xl",
        styles.container,
        className
      )}
      role="navigation"
    >
      {finalItems?.map((item, index) => {
        const isActive = index === activeIndex;
        const IconComponent = item.icon;

        return (
          <button
            key={`${item.label}-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg transition-all duration-200 cursor-pointer",
              "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:scale-105 active:scale-95",
              styles.item,
              isActive && "text-primary",
              !isActive && "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleItemClick(item)}
            aria-label={item.label}
            data-index={index}
            type="button"
          >
            <div
              className={cn(
                "flex items-center justify-center transition-all duration-200",
                animated && isActive && "animate-bounce",
                orientation === "horizontal" && showLabels ? "mb-1" : "",
                orientation === "vertical" && showLabels ? "mb-1" : ""
              )}
            >
              <IconComponent
                className={cn(styles.icon, "transition-colors duration-200")}
              />
            </div>

            {showLabels && (
              <span
                ref={(el) => {
                  textRefs.current[index] = el;
                }}
                className={cn(
                  "font-medium transition-colors duration-200 capitalize",
                  styles.text,
                  "whitespace-nowrap"
                )}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}

      {/* Animated underline for horizontal orientation with labels */}
      {showLabels && orientation === "horizontal" && (
        <div
          className={cn(
            "absolute bottom-2 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out",
            animated ? "transition-all duration-300" : ""
          )}
          style={{
            width: `${underlineWidth}px`,
            left: `${underlineLeft}px`,
          }}
        />
      )}

      {/* Active indicator for vertical orientation or no labels */}
      {(!showLabels || orientation === "vertical") && (
        <div
          className={cn(
            "absolute bg-primary rounded-full transition-all duration-300",
            orientation === "vertical" ? "left-1 w-1 " : "bottom-0.5 "
          )}
          style={{
            [orientation === "vertical" ? "top" : "left"]:
              orientation === "vertical"
                ? `${
                    activeIndex ??
                    0 *
                      (variant === "large"
                        ? 64
                        : variant === "compact"
                        ? 56
                        : variant === "mini"
                        ? 40
                        : 60) +
                      (variant === "large"
                        ? 19
                        : variant === "compact"
                        ? 16
                        : variant === "mini"
                        ? 12
                        : 18)
                  }px`
                : `${
                    activeIndex ??
                    0 *
                      (variant === "large"
                        ? 64
                        : variant === "compact"
                        ? 56
                        : variant === "mini"
                        ? 40
                        : 60) +
                      (variant === "large"
                        ? 19
                        : variant === "compact"
                        ? 16
                        : variant === "mini"
                        ? 12
                        : 18)
                  }px`,
          }}
        />
      )}
    </nav>
  );
};
