"use client";

import { Button } from "@/components/ui/Button";

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
        {/* Placeholder для iframe */}
        <div className="w-full h-[700px] bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-gray-600 mb-4">
              Калькулятор CargoDesk будет встроен здесь
            </p>
            <Button variant="primary" href={calculatorUrl}>
              Перейти в калькулятор
            </Button>
          </div>
        </div>

        {/* Будущий iframe (раскомментировать, когда будет готов) */}
        {/* <iframe
          src={iframeSrc}
          className="w-full h-[700px] rounded-2xl border-0"
          title="Калькулятор CargoDesk"
          loading="lazy"
        /> */}
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

        {/* Placeholder для iframe */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-[500px] bg-gray-100 flex items-center justify-center">
            <div className="text-center px-4">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18" />
                <path d="M8 6h8M8 10h8M8 14h4" />
              </svg>
              <p className="text-gray-600 mb-4">
                Калькулятор CargoDesk будет встроен здесь
              </p>
              <Button variant="primary" href={calculatorUrl}>
                Перейти в калькулятор
              </Button>
            </div>
          </div>
        </div>

        {/* Примечание */}
        <p className="text-sm text-gray-500 text-center mt-4">
          Рассчитайте стоимость вывоза и утилизации отходов онлайн
        </p>

        {/* Будущий iframe (раскомментировать, когда будет готов) */}
        {/* <div className="max-w-4xl mx-auto">
          <iframe
            src={iframeSrc}
            className="w-full h-[500px] rounded-2xl border-0 shadow-lg"
            title="Калькулятор CargoDesk"
            loading="lazy"
          />
        </div> */}
      </div>
    </section>
  );
}
