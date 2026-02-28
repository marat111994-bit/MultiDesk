"use client";

import { motion } from "framer-motion";
import type { Step } from "@/types";

interface HowWeWorkProps {
  title: string;
  steps: Step[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function HowWeWork({ title, steps }: HowWeWorkProps) {
  return (
    <section className="bg-primary-50 py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-center text-gray-900 mb-12"
        >
          {title}
        </motion.h2>

        {/* Desktop: горизонтальная timeline */}
        <div className="hidden lg:block">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative flex justify-between"
          >
            {/* Линия между шагами */}
            <div className="absolute top-7 left-0 right-0 h-0.5 border-t-2 border-dashed border-primary-300" />

            {/* Шаги */}
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative text-center max-w-[180px]"
              >
                {/* Круг с номером */}
                <div className="relative w-14 h-14 rounded-full bg-primary-500 text-white text-xl font-bold flex items-center justify-center mx-auto">
                  {step.number}
                </div>

                {/* Заголовок */}
                <h3 className="font-semibold text-gray-900 mt-4">
                  {step.title}
                </h3>

                {/* Описание */}
                <p className="text-sm text-gray-600 mt-2">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile: вертикальная timeline */}
        <div className="lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative flex gap-4"
              >
                {/* Вертикальная линия */}
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-14 bottom-[-32px] w-0.5 border-l-2 border-dashed border-primary-300" />
                )}

                {/* Круг с номером */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-500 text-white text-xl font-bold flex items-center justify-center">
                  {step.number}
                </div>

                {/* Текст */}
                <div className="pt-2">
                  <h3 className="font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
