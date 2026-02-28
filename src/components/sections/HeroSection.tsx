"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { Badge } from "@/types/service";

type HeroVariant = "service" | "blog" | "calculator" | "about";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  image?: string | null;
  imageAlt?: string;
  badges?: Badge[] | string[];
  ctaPrimary?: { text: string; onClick?: () => void; href?: string };
  ctaSecondary?: { text: string; href: string };
  ctaTertiary?: { text: string; href: string };
  variant?: HeroVariant;
  topBadge?: string;
  // Для blog variant
  date?: string;
  author?: string;
  readingTime?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Анимации для service variant (появление при загрузке)
const serviceHeroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const serviceItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as any },
  },
};

const imageVariants = {
  hidden: { scale: 1.05 },
  visible: {
    scale: 1,
    transition: { duration: 1.5, ease: "easeOut" as any },
  },
};

// Иконки для бейджей
const badgeIcons: Record<string, string> = {
  "shield-check": "📋",
  "dollar-sign": "💰",
  "clock": "⚡",
  "truck": "🚛",
  "leaf": "🌿",
  "file-text": "📄",
  "award": "🏆",
  "recycle": "♻️",
};

export function HeroSection({
  title,
  subtitle,
  image,
  imageAlt = "",
  badges,
  ctaPrimary,
  ctaSecondary,
  ctaTertiary,
  variant = "service",
  topBadge,
  date,
  author,
  readingTime,
}: HeroSectionProps) {
  // Blog variant
  if (variant === "blog") {
    return (
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
            {(date || author || readingTime) && (
              <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
                {date && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {date}
                  </span>
                )}
                {author && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {author}
                  </span>
                )}
                {readingTime && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {readingTime}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // Calculator variant
  if (variant === "calculator") {
    return (
      <section className="bg-gradient-to-br from-gray-900 via-primary-900 to-gray-800 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-gray-300 mt-4">{subtitle}</p>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // About variant
  if (variant === "about") {
    return (
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Фоновое изображение */}
        {image && (
          <motion.div
            className="absolute inset-0"
            initial="hidden"
            animate="visible"
            variants={imageVariants}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover object-center"
              priority
              quality={85}
            />
          </motion.div>
        )}

        {/* Градиентный overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />

        {/* Контент */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            variants={serviceHeroVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.h1
              variants={serviceItemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                variants={serviceItemVariants}
                className="text-lg md:text-xl text-gray-300 mt-4 max-w-xl leading-relaxed"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // Service variant (default) — Full-width фото + overlay
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Фоновое изображение или fallback */}
      {image ? (
        <motion.div
          className="absolute inset-0"
          initial="hidden"
          animate="visible"
          variants={imageVariants}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover object-right-center"
            priority
            loading="eager"
            quality={85}
            sizes="100vw"
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-800 pattern-dots" />
      )}

      {/* Градиентный overlay — слева тёмный, справа прозрачный */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/10" />

      {/* Дополнительный вертикальный градиент снизу (для бейджей) */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />

      {/* Контент поверх */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          variants={serviceHeroVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Мини-тег сверху */}
          {topBadge && (
            <motion.div
              variants={serviceItemVariants}
              className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6"
            >
              {topBadge}
            </motion.div>
          )}

          {/* Заголовок H1 */}
          <motion.h1
            variants={serviceItemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            {title}
          </motion.h1>

          {/* Подзаголовок */}
          {subtitle && (
            <motion.p
              variants={serviceItemVariants}
              className="text-lg md:text-xl text-gray-300 mt-4 max-w-xl leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Кнопки CTA (только 2) */}
          {(ctaPrimary || ctaSecondary) && (
            <motion.div
              variants={serviceItemVariants}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              {ctaPrimary && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={ctaPrimary.onClick}
                  href={ctaPrimary.href}
                  className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-accent-500/25 transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  {ctaPrimary.text}
                </Button>
              )}
              {ctaSecondary && (
                <Button
                  variant="outline"
                  size="lg"
                  href={ctaSecondary.href}
                  className="bg-white/10 backdrop-blur-sm border border-white/25 text-white px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-all"
                >
                  {ctaSecondary.text}
                </Button>
              )}
            </motion.div>
          )}

          {/* Бейджи доверия (3 штуки) */}
          {badges && badges.length > 0 && (
            <motion.div
              variants={serviceItemVariants}
              className="mt-10 flex flex-col md:flex-row gap-4"
            >
              {badges.slice(0, 3).map((badge, index) => {
                // Поддержка старого формата (string[]) и нового (Badge[])
                const badgeData: Badge = typeof badge === "string"
                  ? { value: badge, label: "", icon: "shield-check" }
                  : badge;

                const icon = badgeIcons[badgeData.icon] || "📋";

                return (
                  <motion.div
                    key={index}
                    variants={serviceItemVariants}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-5 py-3 flex items-center gap-3 min-w-[140px]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-500/20 text-accent-400 flex items-center justify-center text-lg flex-shrink-0">
                      {icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">
                        {badgeData.value}
                      </span>
                      {badgeData.label && (
                        <span className="text-gray-400 text-xs">
                          {badgeData.label}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
