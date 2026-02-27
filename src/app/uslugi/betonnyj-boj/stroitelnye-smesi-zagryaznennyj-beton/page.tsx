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
import { betonnyjBoj } from "@/data/services/betonnyj-boj";
import { steps } from "@/data/steps";
import { clients } from "@/data";

const subcategory = betonnyjBoj.subcategories.find(
  (s) => s.id === "stroitelnye-smesi-zagryaznennyj-beton"
)!;

export const metadata: Metadata = {
  title: subcategory.seo.title,
  description: subcategory.seo.description,
  openGraph: {
    title: subcategory.seo.title,
    description: subcategory.seo.description,
    url: "https://danmax.moscow/uslugi/betonnyj-boj/stroitelnye-smesi-zagryaznennyj-beton/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/betonnyj-boj/stroitelnye-smesi-zagryaznennyj-beton/",
  },
};

export default function StroitelnyeSmesiZagryaznennyjBetonPage() {
  const relatedSubcategories = betonnyjBoj.subcategories.filter((s) =>
    subcategory.relatedSubcategories.includes(s.id)
  );

  return (
    <>
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/uslugi/" },
            { label: "Бетонный бой", href: "/uslugi/betonnyj-boj/" },
            { label: subcategory.shortTitle },
          ]}
        />
      </Container>

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

      <TrustNumbers numbers={subcategory.trustNumbers} />

      <WhyUs
        title="Почему выбирают DanMax для вывоза строительных смесей"
        advantages={subcategory.advantages}
        image="/images/why-us/smesi.jpg"
        imageAlt="Вывоз строительных смесей"
      />

      {/* Таблица ФККО */}
      <section className="py-20 bg-white">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Коды ФККО для строительных смесей
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.hazardClass === 4
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

      <HowWeWork
        title="Как заказать вывоз строительных смесей — 5 шагов"
        steps={steps}
      />

      <section id="pricing">
        <PricingTable
          title="Цены на вывоз строительных смесей"
          rows={subcategory.pricing}
          disclaimer="Минимальный заказ — 10 м³. Требуется паспорт отходов IV класса."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      <CalculatorEmbed
        title="Рассчитайте стоимость вывоза смесей онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости вывоза и утилизации"
        preselectedService="stroitelnye-smesi-zagryaznennyj-beton"
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
              <Card key={sub.id} href={`/uslugi/betonnyj-boj/${sub.slug}/`}>
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

      <CasesSection
        title="Наши проекты по вывозу смесей"
        cases={[]}
        clients={clients}
      />

      <FaqSection
        title="Частые вопросы о вывозе строительных смесей"
        items={subcategory.faq}
      />

      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        preselectedService="Строительные смеси"
        variant="full"
      />
    </>
  );
}
