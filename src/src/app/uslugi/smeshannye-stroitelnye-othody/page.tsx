import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/container";
import {
  HeroSection,
  TrustNumbers,
  WhyUs,
  HowWeWork,
  PricingTable,
  CalculatorEmbed,
  CasesSection,
  FaqSection,
  ContactForm,
} from "@/components/sections";
import { smeshannyeOthody } from "@/data/services/smeshannye-othody";
import { steps } from "@/data/steps";
import { cases, clients } from "@/data";

const service = smeshannyeOthody;

export const metadata: Metadata = {
  title: service.seo.title,
  description: service.seo.description,
  openGraph: {
    title: service.seo.title,
    description: service.seo.description,
    url: "https://danmax.moscow/uslugi/smeshannye-stroitelnye-othody/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/smeshannye-stroitelnye-othody/",
  },
};

export default function SmeshannyeOthodyPage() {
  return (
    <>
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/uslugi/" },
            { label: service.shortTitle },
          ]}
        />
      </Container>

      <HeroSection
        variant="service"
        title={service.seo.h1}
        subtitle={service.shortDescription}
        image={service.heroImage}
        imageAlt={service.heroImageAlt}
        badges={service.badges}
        ctaPrimary={{ text: "Рассчитать стоимость" }}
        ctaSecondary={{ text: "Наши услуги", href: "/uslugi/" }}
        ctaTertiary={{ text: "Смотреть цены", href: "#pricing" }}
      />

      <TrustNumbers numbers={service.trustNumbers} />

      <WhyUs
        title="Почему выбирают DanMax для вывоза смешанных отходов"
        advantages={service.advantages}
        image="/images/why-us/smeshannye-othody.svg"
        imageAlt="Вывоз смешанных отходов DanMax"
      />

      <HowWeWork
        title="Как заказать вывоз смешанных отходов — 5 шагов"
        steps={steps}
      />

      <section id="pricing">
        <PricingTable
          title="Цены на вывоз смешанных строительных отходов"
          rows={service.pricing}
          disclaimer="Минимальный заказ — 10 м³. Точная стоимость зависит от объёма и расстояния."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      {/* ФККО Таблица */}
      <section className="py-20 bg-white">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Коды ФККО для смешанных отходов
          </h2>
          <div className="max-w-4xl mx-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Код ФККО
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Наименование отхода
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    Класс опасности
                  </th>
                </tr>
              </thead>
              <tbody>
                {service.fkkoTable.map((row, index) => (
                  <tr
                    key={row.code}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-4 px-4 font-mono text-sm text-gray-900">
                      {row.code}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{row.name}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.hazardClass === 3
                            ? "bg-orange-500 text-white"
                            : row.hazardClass === 4
                            ? "bg-yellow-400 text-gray-900"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {row.hazardClass} класс
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <CalculatorEmbed
        title="Рассчитайте стоимость вывоза смешанных отходов онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости вывоза и утилизации"
        preselectedService="smeshannye-othody"
        variant="embedded"
      />

      <CasesSection
        title="Наши проекты по вывозу смешанных отходов"
        cases={cases.filter((c) => c.serviceType === "smeshannye-othody")}
        clients={clients}
      />

      <FaqSection
        title="Частые вопросы о вывозе смешанных отходов"
        items={service.faq}
      />

      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        preselectedService="Смешанные отходы"
        variant="full"
      />
    </>
  );
}
