"use client";

import Image from "next/image";
import type { CaseItem, Client } from "@/types";

interface CasesSectionProps {
  title: string;
  cases: CaseItem[];
  clients?: Client[];
  filterByService?: string;
}

export function CasesSection({
  title,
  cases,
  clients,
  filterByService,
}: CasesSectionProps) {
  // Фильтрация кейсов по типу услуги
  const filteredCases = filterByService
    ? cases.filter((c) => c.serviceType === filterByService)
    : cases;

  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          {title}
        </h2>

        {/* Кейсы: горизонтальный скролл */}
        {filteredCases.length > 0 && (
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {filteredCases.map((caseItem, index) => (
              <div
                key={index}
                className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                {/* Изображение */}
                <div className="relative h-48 bg-gray-200">
                  {caseItem.image ? (
                    <Image
                      src={caseItem.image}
                      alt={caseItem.title}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Контент */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {caseItem.title}
                  </h3>

                  {caseItem.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {caseItem.description}
                    </p>
                  )}

                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      Объём: {caseItem.volume}
                    </span>
                    <span className="text-sm text-gray-600">
                      Срок: {caseItem.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Логотипы клиентов */}
        {clients && clients.length > 0 && (
          <>
            <p className="text-center text-gray-500 mt-16 mb-8">
              Нам доверяют
            </p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {clients.map((client, index) => (
                <div
                  key={index}
                  className="h-10 w-32 rounded bg-gray-200 flex items-center justify-center px-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                >
                  {client.logo ? (
                    <Image
                      src={client.logo}
                      alt={client.name}
                      width={128}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 text-center">
                      {client.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
