"use client";

import React, { useEffect, useRef } from "react";

type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type Range<N extends number> = Enumerate<N>;

interface ScrollBlurWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minVelocity?: Range<101>;
  blurDirection?: "vertical" | "horizontal";
  enableBlur?: boolean; // New prop to optionally disable blur
}

export const ScrollBlurWrapper = ({
  children,
  className,
  style,
  minVelocity = 20,
  blurDirection = "vertical",
  enableBlur = true, // Default to enabled, but allows opt-out
}: ScrollBlurWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFEGaussianBlurElement>(null);
  const lastScrollY = useRef(0);
  const currentBlur = useRef(0);
  const rafId = useRef<number>(0);
  const isAnimating = useRef(false);

  const filterId = React.useId();
  const uniqueFilterId = `motion-blur-${filterId.replace(/:/g, "")}`;

  const effectiveMinVelocity = Math.min(Math.max(minVelocity, 0), 100);

  useEffect(() => {
    // Early return if blur is disabled
    if (!enableBlur) return;

    lastScrollY.current = window.scrollY;
    let lastTime = performance.now();
    const velocityHistory: number[] = [];

    const updateBlur = () => {
      const currentScroll = window.scrollY;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      // Only calculate if enough time has passed (reduce frequency)
      if (deltaTime < 16) {
        rafId.current = requestAnimationFrame(updateBlur);
        return;
      }

      const velocity = Math.abs(currentScroll - lastScrollY.current);
      lastScrollY.current = currentScroll;
      lastTime = currentTime;

      // Keep a small history for smoother transitions
      velocityHistory.push(velocity);
      if (velocityHistory.length > 3) velocityHistory.shift();

      const avgVelocity = velocityHistory.reduce((sum, v) => sum + v, 0) / velocityHistory.length;

      const targetBlur =
        avgVelocity >= effectiveMinVelocity ? Math.min(avgVelocity * 0.15, 10) : 0;

      // Use a more efficient easing
      const difference = targetBlur - currentBlur.current;
      if (Math.abs(difference) < 0.01) {
        currentBlur.current = targetBlur;
      } else {
        currentBlur.current += difference * 0.2;
      }

      if (filterRef.current) {
        const val = currentBlur.current < 0.1 ? 0 : currentBlur.current;

        const stdDeviation =
          blurDirection === "vertical"
            ? `0 ${val.toFixed(1)}`
            : `${val.toFixed(1)} 0`;

        filterRef.current.setAttribute("stdDeviation", stdDeviation);
      }

      // Only continue animation if there's meaningful blur or velocity
      if (currentBlur.current > 0.1 || avgVelocity > 0.5) {
        rafId.current = requestAnimationFrame(updateBlur);
      } else {
        isAnimating.current = false;
      }
    };

    const handleScroll = () => {
      // Only start animation loop if not already running
      if (!isAnimating.current) {
        isAnimating.current = true;
        rafId.current = requestAnimationFrame(updateBlur);
      }
    };

    // Use passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [effectiveMinVelocity, blurDirection, enableBlur]);

  return (
    <>
      {/* Only render SVG filter when blur is enabled */}
      {enableBlur && (
        <svg
          style={{
            pointerEvents: "none",
            position: "absolute",
            height: 0,
            width: 0,
            opacity: 0,
          }}
          aria-hidden="true"
        >
          <defs>
            <filter id={uniqueFilterId}>
              <feGaussianBlur
                ref={filterRef}
                in="SourceGraphic"
                stdDeviation="0 0"
              />
            </filter>
          </defs>
        </svg>
      )}
      <div
        ref={ref}
        className={className}
        style={{
          ...style,
          ...(enableBlur && {
            filter: `url(#${uniqueFilterId})`,
            willChange: "filter",
          }),
        }}
      >
        {children}
      </div>
    </>
  );
};