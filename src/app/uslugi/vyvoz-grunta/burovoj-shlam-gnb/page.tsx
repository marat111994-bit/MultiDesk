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
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { vyvozGrunta } from "@/data/services/vyvoz-grunta";
import { steps } from "@/data/steps";
import { cases, clients } from "@/data";

const subcategory = vyvozGrunta.subcategories.find(
  (s) => s.id === "burovoj-shlam-gnb"
)!;

export const metadata: Metadata = {
  title: subcategory.seo.title,
  description: subcategory.seo.description,
  openGraph: {
    title: subcategory.seo.title,
    description: subcategory.seo.description,
    url: "https://danmax.moscow/uslugi/vyvoz-grunta/burovoj-shlam-gnb/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/vyvoz-grunta/burovoj-shlam-gnb/",
  },
};

// Цвета для классов опасности
const hazardClassColors: Record<number, string> = {
  1: "bg-red-900 text-white",
  2: "bg-red-500 text-white",
  3: "bg-orange-500 text-white",
  4: "bg-yellow-400 text-gray-900",
  5: "bg-green-500 text-white",
};

const hazardClassLabels: Record<number, string> = {
  1: "Чрезвычайно опасные",
  2: "Высокоопасные",
  3: "Умеренно опасные",
  4: "Малоопасные",
  5: "Практически неопасные",
};

export default function BurovojShlamGnbPage() {
  // Находим смежные подкатегории
  const relatedSubcategories = vyvozGrunta.subcategories.filter((s) =>
    subcategory.relatedSubcategories.includes(s.id)
  );

  return (
    <>
      {/* Хлебные крошки */}
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/uslugi/" },
            { label: "Вывоз грунта", href: "/uslugi/vyvoz-grunta/" },
            { label: subcategory.shortTitle },
          ]}
        />
      </Container>

      {/* Hero Section */}
      <HeroSection
        variant="service"
        title={subcategory.seo.h1}
        subtitle={subcategory.shortDescription}
        image={subcategory.heroImage}
        imageAlt={subcategory.heroImageAlt}
        badges={subcategory.badges}
        ctaPrimary={{ text: "Рассчитать стоимость" }}
        ctaSecondary={{ text: "Наши услуги", href: "/uslugi/" }}
        ctaTertiary={{ text: "Смотреть цены", href: "#pricing" }}
      />

      {/* Trust Numbers */}
      <TrustNumbers numbers={subcategory.trustNumbers} />

      {/* Why Us */}
      <WhyUs
        title="Почему выбирают DanMax для утилизации бурового шлама ГНБ"
        advantages={subcategory.advantages}
        image="/images/why-us/burovoj-shlam-gnb.jpg"
        imageAlt="Утилизация бурового шлама ГНБ"
      />

      {/* Таблица ФККО — уникальный блок для подкатегории */}
      <section className="py-20 bg-white">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Коды ФККО для бурового шлама ГНБ
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
                {subcategory.fkkoTable.map((row, index) => (
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
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            hazardClassColors[row.hazardClass]
                          }`}
                        >
                          {row.hazardClass} класс
                        </span>
                        <span className="text-xs text-gray-500">
                          {hazardClassLabels[row.hazardClass]}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="max-w-2xl mx-auto text-center mt-8 p-6 bg-primary-50 rounded-xl">
            <p className="text-gray-700">
              <strong>Не знаете код ФККО ваших отходов?</strong> Мы поможем
              определить — оставьте заявку, и наш специалист проведёт
              лабораторный анализ.
            </p>
            <Button variant="primary" className="mt-4" href="#contact">
              Оставить заявку
            </Button>
          </div>
        </Container>
      </section>

      {/* How We Work */}
      <HowWeWork
        title="Как заказать утилизацию бурового шлама ГНБ — 5 шагов"
        steps={steps}
      />

      {/* Pricing Table */}
      <section id="pricing">
        <PricingTable
          title="Цены на утилизацию бурового шлама ГНБ"
          rows={subcategory.pricing}
          disclaimer="Минимальный заказ — 10 м³. Точная стоимость зависит от объёма, класса опасности и расстояния."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      {/* Calculator Embed */}
      <CalculatorEmbed
        title="Рассчитайте стоимость утилизации бурового шлама ГНБ онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости вывоза и утилизации"
        preselectedService="burovoj-shlam-gnb"
        variant="embedded"
      />

      {/* Смежные услуги */}
      <section className="py-20 bg-gray-50">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Смежные услуги
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {relatedSubcategories.map((sub) => (
              <Card key={sub.id} href={`/uslugi/vyvoz-grunta/${sub.slug}/`}>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {sub.shortTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {sub.shortDescription}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sub.badges.slice(0, 2).map((badge, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Подробнее
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Cases Section */}
      <CasesSection
        title="Наши проекты по утилизации бурового шлама ГНБ"
        cases={cases.filter((c) => c.serviceType === "vyvoz-grunta")}
        clients={clients}
      />

      {/* FAQ Section */}
      <FaqSection
        title="Частые вопросы об утилизации бурового шлама ГНБ"
        items={subcategory.faq}
      />

      {/* Contact Form */}
      <section id="contact">
        <ContactForm
          title="Оставьте заявку — рассчитаем стоимость за 15 минут"
          subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
          preselectedService="Буровой шлам ГНБ"
          variant="full"
        />
      </section>
    </>
  );
}
