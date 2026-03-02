"use client";

import MiniCalculator from "@/components/calculator/MiniCalculator";

type CalculatorVariant = "embedded" | "full";

interface CalculatorEmbedProps {
  title?: string;
  subtitle?: string;
  preselectedService?: string;
  variant?: CalculatorVariant;
}

export function CalculatorEmbed({
  title,
  subtitle,
  preselectedService,
  variant = "embedded",
}: CalculatorEmbedProps) {
  // URL калькулятора CargoDesk (будет заменён на реальный)
  const calculatorUrl = "/calculator/";
  
  // Формируем URL с параметром услуги (для будущего iframe)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const iframeSrc = `${calculatorUrl}${preselectedService ? `?service=${preselectedService}` : ""}`;

  // Полная версия (на всю ширину)
  if (variant === "full") {
    return (
      <div className="w-full">
        <MiniCalculator />
      </div>
    );
  }

  // Встроенная версия (с заголовком и фоном)
  return (
    <section className="bg-primary-50 py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        {title && (
          <h2 className="text-3xl font-bold text-center text-gray-900">
            {title}
          </h2>
        )}

        {subtitle && (
          <p className="text-gray-600 text-center mt-2 mb-10">{subtitle}</p>
        )}

        {/* Мини-калькулятор */}
        <div className="max-w-4xl mx-auto">
          <MiniCalculator />
        </div>

        {/* Примечание */}
        <p className="text-sm text-gray-500 text-center mt-4">
          Рассчитайте стоимость вывоза и утилизации отходов онлайн
        </p>
      </div>
    </section>
  );
}
