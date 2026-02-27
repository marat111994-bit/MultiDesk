"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

type HeroVariant = "service" | "blog" | "calculator" | "about";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  badges?: string[];
  ctaPrimary?: { text: string; onClick?: () => void };
  ctaSecondary?: { text: string; href: string };
  ctaTertiary?: { text: string; href: string };
  variant?: HeroVariant;
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
            {subtitle && (
              <p className="text-lg text-gray-600 mt-4">{subtitle}</p>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // About variant
  if (variant === "about") {
    return (
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.h1
                variants={itemVariants}
                className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p
                  variants={itemVariants}
                  className="text-lg text-gray-600"
                >
                  {subtitle}
                </motion.p>
              )}
            </motion.div>
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-xl"
              >
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Service variant (default)
  return (
    <section className="bg-gray-50 min-h-[600px] flex items-center py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Левая часть: текст */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:w-[55%] space-y-6"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-600"
              >
                {subtitle}
              </motion.p>
            )}

            {/* Кнопки */}
            {(ctaPrimary || ctaSecondary || ctaTertiary) && (
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-8">
                {ctaPrimary && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={ctaPrimary.onClick}
                    className="w-full sm:w-auto"
                  >
                    {ctaPrimary.text}
                  </Button>
                )}
                {ctaSecondary && (
                  <Button
                    variant="outline"
                    size="lg"
                    href={ctaSecondary.href}
                    className="w-full sm:w-auto"
                  >
                    {ctaSecondary.text}
                  </Button>
                )}
                {ctaTertiary && (
                  <a
                    href={ctaTertiary.href}
                    className="text-primary-500 hover:text-primary-700 hover:underline font-medium self-center sm:self-auto transition-colors"
                  >
                    {ctaTertiary.text}
                  </a>
                )}
              </motion.div>
            )}

            {/* Badges */}
            {badges && badges.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-6 mt-6"
              >
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-gray-600">{badge}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Правая часть: изображение */}
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-[45%] w-full"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-200">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
