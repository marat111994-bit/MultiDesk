"use client";

import { Button } from "@/components/ui/Button";
import type { PriceRow } from "@/types";

interface PricingTableProps {
  title: string;
  rows: PriceRow[];
  disclaimer?: string;
  ctaText?: string;
  onOrderClick?: (row: PriceRow) => void;
}

export function PricingTable({
  title,
  rows,
  disclaimer,
  ctaText,
  onOrderClick,
}: PricingTableProps) {
  const handleOrder = (row: PriceRow) => {
    if (onOrderClick) {
      onOrderClick(row);
    } else {
      console.log("Заказать:", row);
    }
  };

  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          {title}
        </h2>

        {/* Desktop: таблица */}
        <div className="hidden md:block">
          <table className="w-full max-w-4xl mx-auto">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Услуга
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Ед.
                </th>
                <th className="text-right py-4 px-6 font-semibold text-gray-900">
                  Цена
                </th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-4 px-6">
                    {row.link ? (
                      <a
                        href={row.link}
                        className="font-medium text-gray-900 hover:text-primary-500 hover:underline transition-colors"
                      >
                        {row.service}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900">
                        {row.service}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{row.unit}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-bold text-lg text-primary-600">
                      от {row.price.toLocaleString("ru-RU")} ₽/{row.unit}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOrder(row)}
                    >
                      Заказать
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: карточки */}
        <div className="md:hidden space-y-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="space-y-3">
                {row.link ? (
                  <a
                    href={row.link}
                    className="font-semibold text-gray-900 hover:text-primary-500 hover:underline transition-colors block"
                  >
                    {row.service}
                  </a>
                ) : (
                  <h3 className="font-semibold text-gray-900">
                    {row.service}
                  </h3>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {row.unit === "м³" ? "за" : "за"} {row.unit}
                  </span>
                  <span className="font-bold text-xl text-primary-600">
                    от {row.price.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleOrder(row)}
                  className="w-full"
                >
                  Заказать
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <p className="text-sm text-gray-500 text-center mt-6">
            {disclaimer}
          </p>
        )}

        {/* Общая CTA */}
        {ctaText && (
          <div className="text-center mt-8">
            <Button variant="primary" size="lg">
              {ctaText}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
