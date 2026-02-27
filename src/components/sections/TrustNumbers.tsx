"use client";

import { CountUp } from "@/components/ui/CountUp";
import type { TrustNumber } from "@/types";

interface TrustNumbersProps {
  numbers: TrustNumber[];
}

export function TrustNumbers({ numbers }: TrustNumbersProps) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {numbers.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary-500">
                <CountUp end={item.value} suffix={item.suffix} duration={2} />
              </div>
              <p className="text-sm text-gray-600 mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
