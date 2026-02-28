"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigation } from "@/data";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const servicesItem = navigation.find((item) => item.label === "Услуги");
  const otherItems = navigation.filter((item) => item.label !== "Услуги");

  // Обработчик скролла для тени
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Блокировка скролла при открытом мобильном меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Закрытие меню при нажатии Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMegaMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Обработчики для мегаменю с задержкой
  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 150);
  };

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
          <div className="flex h-16 items-center justify-between border-b border-gray-200">
            {/* Логотип */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  <span className="text-primary-500">Dan</span>
                  <span className="text-gray-900">Max</span>
                </span>
              </div>
            </Link>

            {/* Desktop навигация */}
            <nav className="hidden lg:flex items-center gap-8">
              {/* Услуги с MegaMenu */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    pathname?.startsWith("/uslugi/") || isMegaMenuOpen
                      ? "text-primary-500"
                      : "text-gray-700 hover:text-primary-500"
                  }`}
                  aria-expanded={isMegaMenuOpen}
                  aria-haspopup="true"
                >
                  Услуги
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      isMegaMenuOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* MegaMenu */}
                <MegaMenu
                  items={servicesItem?.children || []}
                  isOpen={isMegaMenuOpen}
                  onClose={() => setIsMegaMenuOpen(false)}
                />
              </div>

              {/* Остальные пункты */}
              {otherItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-primary-500 font-semibold"
                      : "text-gray-700 hover:text-primary-500"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Кнопка CTA + бургер */}
            <div className="flex items-center gap-4">
              {/* Desktop кнопка */}
              <button className="hidden lg:block bg-accent-500 hover:bg-accent-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors">
                Заказать расчёт
              </button>

              {/* Mobile бургер */}
              <button
                className="lg:hidden p-2 text-gray-700"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Открыть меню"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenu
          onClose={() => setIsMobileMenuOpen(false)}
          servicesItem={servicesItem}
          otherItems={otherItems}
          pathname={pathname}
        />
      )}
    </>
  );
}
