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
import { getServices, getCases, getClients, getTrustNumbers, getSteps, getHomeAdvantages, getPromo, getHomePageSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "DanMax — Вывоз и утилизация строительных отходов в Москве",
  description:
    "Вывоз грунта, бетона, кирпича, асфальта в Москве и МО. Собственный автопарк, все лицензии 1–5 класс. Рассчитайте стоимость онлайн.",
  openGraph: {
    title: "DanMax — Вывоз и утилизация строительных отходов в Москве",
    description:
      "Вывоз грунта, бетона, кирпича, асфальта в Москве и МО. Собственный автопарк, все лицензии 1–5 класс.",
    url: "https://danmax.moscow/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/",
  },
};

// JSON-LD разметка Organization
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DanMax",
  url: "https://danmax.moscow",
  telephone: "+74951234567",
  address: {
    "@type": "PostalAddress",
    streetAddress: "пр-кт. Кутузовский, 10",
    addressLocality: "Москва",
    addressCountry: "RU",
  },
  logo: "https://danmax.moscow/images/logo.svg",
  sameAs: [
    "https://t.me/danmax_logistic",
    "https://wa.me/74951234567",
  ],
};

export default async function HomePage() {
  const [services, cases, clients, trustNumbers, steps, advantages, promo, homeSettings] = await Promise.all([
    getServices(),
    getCases(),
    getClients(),
    getTrustNumbers(),
    getSteps(),
    getHomeAdvantages(),
    getPromo(),
    getHomePageSettings(),
  ])

  const mainServices = services.slice(0, 6)

  // Обзорные цены для главной
  const overviewPricing = services.map(service => ({
    service: service.shortTitle,
    unit: "м³",
    price: parseInt(service.pricing[0]?.price) || 350,
    link: `/uslugi/${service.slug}/`,
  }))

  return (
    <>
      {/* JSON-LD Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* Хлебные крошки (для главной — просто "Главная") */}
      <Container>
        <Breadcrumbs items={[{ label: "Главная" }]} />
      </Container>

      {/* Hero Section */}
      <HeroSection
        variant="service"
        title={homeSettings.heroTitle}
        subtitle={homeSettings.heroSubtitle}
        image={homeSettings.heroImage}
        imageAlt={homeSettings.heroImageAlt}
        badges={homeSettings.heroBadges.map((value: string) => ({ value, label: '', icon: 'shield-check' }))}
        ctaPrimary={{ text: "Рассчитать стоимость" }}
        ctaSecondary={{ text: "Наши услуги", href: "/uslugi/" }}
        ctaTertiary={{ text: "Смотреть цены", href: "#pricing" }}
      />

      {/* Trust Numbers */}
      <TrustNumbers numbers={trustNumbers} />

      {/* Наши услуги */}
      <section className="py-20">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Наши услуги
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {mainServices.map((service) => (
              <Card key={service.slug} href={`/uslugi/${service.slug}/`}>
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {service.shortTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.shortDescription}
                </p>
                <Button variant="ghost" size="sm" className="w-full justify-between group">
                  <span>Подробнее</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Us */}
      <WhyUs
        title="Почему выбирают DanMax"
        advantages={advantages}
        image={homeSettings.whyUsImage}
        imageAlt={homeSettings.whyUsImageAlt}
      />

      {/* How We Work */}
      <HowWeWork
        title="Как мы работаем — 5 простых шагов"
        steps={steps}
      />

      {/* Pricing Table */}
      <section id="pricing">
        <PricingTable
          title="Цены на вывоз строительных отходов в Москве"
          rows={overviewPricing}
          disclaimer="Минимальный заказ — 10 м³. Точная стоимость зависит от объёма, типа отходов и расстояния."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      {/* Calculator Embed */}
      <CalculatorEmbed
        title="Рассчитайте стоимость онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости вывоза и утилизации отходов"
        variant="embedded"
      />

      {/* Cases Section */}
      <CasesSection
        title="Наши проекты"
        cases={cases.map(c => ({
          title: c.title,
          image: c.image || "",
          volume: c.volume || "",
          duration: c.duration || "",
          serviceType: "ground",
          description: c.description || undefined,
        }))}
        clients={clients.map(c => ({
          name: c.name,
          logo: c.logo || "",
        }))}
      />

      {/* FAQ Section */}
      <FaqSection
        title="Частые вопросы о вывозе и утилизации отходов"
        items={[]}
      />

      {/* Contact Form */}
      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        variant="full"
      />
    </>
  );
}
