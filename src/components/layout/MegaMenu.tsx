"use client";

import { motion } from "framer-motion";
import type { NavigationItem } from "@/types";

interface MegaMenuProps {
  items?: NavigationItem[];
}

export function MegaMenu({ items = [] }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 right-0 top-full bg-white shadow-xl border-t-2 border-primary-500 z-50"
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <div className="grid grid-cols-3 gap-8 py-8">
          {items.map((service) => (
            <div key={service.label} className="space-y-3">
              {/* Заголовок услуги */}
              <a
                href={service.href}
                className="text-base font-bold text-gray-900 hover:text-primary-500 transition-colors block"
              >
                {service.label}
              </a>

              {/* Подкатегории */}
              {service.children && service.children.length > 0 && (
                <ul className="space-y-2">
                  {service.children.map((sub) => (
                    <li key={sub.label}>
                      <a
                        href={sub.href}
                        className="text-sm text-gray-600 hover:text-primary-500 transition-colors block"
                      >
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
