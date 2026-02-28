"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NavigationItem } from "@/types";
import { contacts } from "@/data";

interface MobileMenuProps {
  onClose: () => void;
  servicesItem?: NavigationItem;
  otherItems: NavigationItem[];
  pathname?: string | null;
}

export function MobileMenu({
  onClose,
  servicesItem,
  otherItems,
  pathname,
}: MobileMenuProps) {
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header с кнопкой закрытия */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-lg font-bold">
              <span className="text-primary-500">Dan</span>
              <span className="text-gray-900">Max</span>
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label="Закрыть меню"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Навигация */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Услуги с аккордеоном */}
            {servicesItem && (
              <div className="space-y-2">
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="flex items-center justify-between w-full py-3 text-left text-base font-medium text-gray-900 hover:text-primary-500 transition-colors"
                  aria-expanded={isServicesOpen}
                >
                  {servicesItem.label}
                  <svg
                    className={`h-5 w-5 transition-transform ${
                      isServicesOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isServicesOpen && servicesItem.children && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2 pl-4 pb-4 border-l-2 border-gray-100">
                      {servicesItem.children.map((service) => (
                        <li key={service.label} className="space-y-1">
                          <a
                            href={service.href}
                            className={`block py-2 text-sm ${
                              pathname === service.href
                                ? "text-primary-500 font-semibold"
                                : "text-gray-600 hover:text-primary-500"
                            }`}
                            onClick={onClose}
                          >
                            {service.label}
                          </a>
                          {/* Подкатегории */}
                          {service.children && (
                            <ul className="space-y-1 pl-4 mt-1">
                              {service.children.map((sub) => (
                                <li key={sub.label}>
                                  <a
                                    href={sub.href}
                                    className={`block py-1 text-sm ${
                                      pathname === sub.href
                                        ? "text-primary-500 font-semibold"
                                        : "text-gray-500 hover:text-primary-500"
                                    }`}
                                    onClick={onClose}
                                  >
                                    {sub.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            )}

            {/* Остальные пункты */}
            {otherItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`block py-3 text-base font-medium ${
                  pathname === item.href
                    ? "text-primary-500"
                    : "text-gray-900 hover:text-primary-500"
                }`}
                onClick={onClose}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Footer с контактами и кнопкой */}
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Телефон */}
            <a
              href={`tel:${contacts.phoneRaw}`}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-primary-500 transition-colors"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              {contacts.phone}
            </a>

            {/* Мессенджеры */}
            <div className="flex gap-3">
              <a
                href={contacts.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </a>
              <a
                href={contacts.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>

            {/* Кнопка CTA */}
            <button className="w-full bg-accent-500 hover:bg-accent-600 text-white rounded-lg px-6 py-3 text-base font-semibold transition-colors">
              Заказать расчёт
            </button>

            {/* Режим работы */}
            <p className="text-sm text-gray-500 text-center">{contacts.workingHours}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
