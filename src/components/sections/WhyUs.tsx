"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Advantage } from "@/types";

interface WhyUsProps {
  title: string;
  advantages: Advantage[];
  image: string;
  imageAlt: string;
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

export function WhyUs({ title, advantages, image, imageAlt }: WhyUsProps) {
  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Левая часть: текст */}
          <div className="lg:w-[60%] w-full">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-8"
            >
              {title}
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex gap-4"
                >
                  {/* Иконка */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>

                  {/* Текст */}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{advantage.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Правая часть: изображение */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:w-[40%] w-full"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gray-200">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
