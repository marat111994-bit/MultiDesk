"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { NavigationItem } from "@/types";
import { Button } from "@/components/ui/Button";

interface MegaMenuProps {
  items?: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
}

// Данные для услуг без подкатегорий
const serviceNoSubcategoryData: Record<string, { description: string; price: string }> = {
  "Асфальтовый бой": {
    description: "Асфальтовая крошка от фрезерования и демонтажа дорог. Вывоз и утилизация с полным пакетом документов.",
    price: "от 450 ₽/м³",
  },
  "Смешанные отходы": {
    description: "Разнородные отходы сноса и ремонта. Сортировка, вывоз и утилизация на лицензированных полигонах.",
    price: "от 550 ₽/м³",
  },
};

export function MegaMenu({ items = [], isOpen, onClose }: MegaMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Сброс на первую услугу при открытии
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Закрытие с анимацией
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150);
  };

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const activeService = items[activeIndex];
  const hasSubcategories = activeService?.children && activeService.children.length > 0;
  const noSubcategoryData = activeService ? serviceNoSubcategoryData[activeService.label] : null;

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Мегаменю панель */}
      <AnimatePresence>
        {(isOpen || isClosing) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 z-50"
          >
            {/* Треугольник-указатель */}
            <div className="absolute left-0 top-0 -mt-2 ml-16">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M0 10L8 0L16 10H0Z" fill="white" />
              </svg>
            </div>

            {/* Контейнер меню */}
            <div className="relative bg-white shadow-2xl rounded-xl border border-gray-100 min-w-[640px] overflow-hidden">
              <div className="flex">
                {/* ЛЕВЫЙ СТОЛБЕЦ — список услуг */}
                <div className="w-[220px] bg-gray-50 py-3 flex-shrink-0">
                  {items.map((service, index) => {
                    const isActive = index === activeIndex;
                    const hasChildren = service.children && service.children.length > 0;

                    return (
                      <Link
                        key={service.label}
                        href={service.href}
                        className={`block px-5 py-3 cursor-pointer transition-all duration-150 ${
                          isActive
                            ? "bg-white text-primary-600 font-semibold shadow-sm"
                            : "bg-transparent text-gray-700 font-medium hover:bg-white hover:text-primary-500"
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={handleClose}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{service.label}</span>
                          <svg
                            className={`w-4 h-4 transition-all duration-150 ${
                              isActive ? "opacity-100 text-primary-500" : "opacity-0"
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* ПРАВЫЙ СТОЛБЕЦ — подкатегории или описание */}
                <div className="flex-1 min-w-[380px] p-6 flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col"
                    >
                      {/* Заголовок услуги */}
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {activeService?.label}
                      </h3>

                      {/* Подкатегории или описание */}
                      {hasSubcategories ? (
                        <div className="flex flex-col gap-1 flex-1">
                          {activeService.children!.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={handleClose}
                            >
                              <span className="text-gray-300 group-hover:text-primary-500 transition-colors">
                                →
                              </span>
                              <span className="text-sm text-gray-700 hover:text-primary-600 whitespace-nowrap">
                                {sub.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : noSubcategoryData ? (
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {noSubcategoryData.description}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {noSubcategoryData.price}
                          </p>
                          <Link
                            href={activeService.href}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline transition-colors w-fit"
                            onClick={handleClose}
                          >
                            Перейти к услуге →
                          </Link>
                        </div>
                      ) : null}

                      {/* Разделитель и CTA */}
                      <div className="border-t border-gray-100 mt-auto pt-4">
                        <p className="text-sm text-gray-500 mb-3">
                          Нужна консультация?
                        </p>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="primary"
                            size="sm"
                            href="/calculator/"
                            onClick={handleClose}
                          >
                            Заказать расчёт
                          </Button>
                          <Link
                            href="/calculator/"
                            className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                            onClick={handleClose}
                          >
                            Рассчитать стоимость →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
