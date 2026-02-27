import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/container";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
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

const service = vyvozGrunta;

export const metadata: Metadata = {
  title: service.seo.title,
  description: service.seo.description,
  openGraph: {
    title: service.seo.title,
    description: service.seo.description,
    url: "https://danmax.moscow/uslugi/vyvoz-grunta/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: service.heroImage || "/images/og/og-default.svg",
        alt: service.heroImageAlt,
      },
    ],
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/vyvoz-grunta/",
  },
};

export default function VyvozGruntaPage() {
  return (
    <>
      {/* JSON-LD разметка услуги */}
      <ServiceJsonLd service={service} />

      {/* Хлебные крошки */}
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/uslugi/" },
            { label: service.shortTitle },
          ]}
        />
      </Container>

      {/* Hero Section */}
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

      {/* Trust Numbers */}
      <TrustNumbers numbers={service.trustNumbers} />

      {/* Why Us */}
      <WhyUs
        title="Почему выбирают DanMax для вывоза грунта"
        advantages={service.advantages}
        image="/images/why-us/vyvoz-grunta.jpg"
        imageAlt="Вывоз грунта DanMax"
      />

      {/* How We Work */}
      <HowWeWork
        title="Как заказать вывоз грунта — 5 шагов"
        steps={steps}
      />

      {/* Pricing Table */}
      <section id="pricing">
        <PricingTable
          title="Цены на вывоз грунта в Москве"
          rows={service.pricing}
          disclaimer="Минимальный заказ — 10 м³. Точная стоимость зависит от объёма, типа грунта и расстояния."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      {/* Подкатегории */}
      <section className="py-20 bg-gray-50">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Виды грунта, которые мы вывозим
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {service.subcategories.map((sub) => (
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

      {/* Calculator Embed */}
      <CalculatorEmbed
        title="Рассчитайте стоимость вывоза грунта онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости вывоза и утилизации грунта"
        preselectedService="vyvoz-grunta"
        variant="embedded"
      />

      {/* Cases Section */}
      <CasesSection
        title="Наши проекты по вывозу грунта"
        cases={cases.filter((c) => c.serviceType === "vyvoz-grunta")}
        clients={clients}
        filterByService="vyvoz-grunta"
      />

      {/* FAQ Section */}
      <FaqSection
        title="Частые вопросы о вывозе грунта"
        items={service.faq}
      />

      {/* Contact Form */}
      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        preselectedService="Вывоз грунта"
        variant="full"
      />
    </>
  );
}
