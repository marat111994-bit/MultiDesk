"use client";

import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CountUp({
  end,
  suffix = "",
  duration = 2,
  className = "",
}: CountUpProps) {
  const { ref, isInView } = useInView({ triggerOnce: true });
  const { formattedCount: displayCount } = useCountUp({
    end: isInView ? end : 0,
    duration: duration * 1000,
    start: 0,
  });

  return (
    <span ref={ref} className={className}>
      {displayCount}
      {suffix}
    </span>
  );
}
