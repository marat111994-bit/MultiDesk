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
import { cases, clients } from "@/data";

const service = betonnyjBoj;

export const metadata: Metadata = {
  title: service.seo.title,
  description: service.seo.description,
  openGraph: {
    title: service.seo.title,
    description: service.seo.description,
    url: "https://danmax.moscow/uslugi/betonnyj-boj/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/betonnyj-boj/",
  },
};

export default function BetonnyjBojPage() {
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
        title="Почему выбирают DanMax для вывоза бетонного боя"
        advantages={service.advantages}
        image="/images/why-us/betonnyj-boj.svg"
        imageAlt="Вывоз бетонного боя DanMax"
      />

      <HowWeWork
        title="Как заказать вывоз бетонного боя — 5 шагов"
        steps={steps}
      />

      <section id="pricing">
        <PricingTable
          title="Цены на вывоз бетонного боя в Москве"
          rows={service.pricing}
          disclaimer="Минимальный заказ — 10 м³. Точная стоимость зависит от объёма, типа бетона и расстояния."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      <section className="py-20 bg-gray-50">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Виды бетонного боя, которые мы вывозим
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {service.subcategories.map((sub) => (
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

      <CalculatorEmbed
        title="Рассчитайте стоимость вывоза бетонного боя онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости вывоза и утилизации"
        preselectedService="betonnyj-boj"
        variant="embedded"
      />

      <CasesSection
        title="Наши проекты по вывозу бетонного боя"
        cases={cases.filter((c) => c.serviceType === "betonnyj-boj")}
        clients={clients}
      />

      <FaqSection
        title="Частые вопросы о вывозе бетонного боя"
        items={service.faq}
      />

      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        preselectedService="Бетонный бой"
        variant="full"
      />
    </>
  );
}
