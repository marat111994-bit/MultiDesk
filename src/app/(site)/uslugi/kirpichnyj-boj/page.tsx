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
import { getServiceBySlug } from "@/lib/data";
import { steps } from "@/data/steps";
import { clients } from "@/data";

export const metadata: Metadata = {
  title: "Вывоз и утилизация кирпичного боя в Москве — цены, ФККО | DanMax",
  description: "Вывоз кирпичного боя в Москве и МО: строительный, огнеупорный. Дробление, переработка. ФККО 81220101205. Лицензия. От 450 ₽/м³.",
  openGraph: {
    title: "Вывоз и утилизация кирпичного боя в Москве — цены, ФККО | DanMax",
    description: "Вывоз кирпичного боя в Москве и МО: строительный, огнеупорный. Дробление, переработка. ФККО 81220101205. Лицензия. От 450 ₽/м³.",
    url: "https://danmax.moscow/uslugi/kirpichnyj-boj/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/kirpichnyj-boj/",
  },
};

export default async function KirpichnyjBojPage() {
  const service = await getServiceBySlug("kirpichnyj-boj");

  if (!service) {
    return <div>Услуга не найдена</div>;
  }
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
        title={service.seoH1 || service.title}
        subtitle={service.shortDescription}
        image={service.heroImage || undefined}
        imageAlt={service.heroImageAlt || undefined}
        badges={service.badges}
        topBadge={service.topBadge}
        ctaPrimary={{ text: "Рассчитать стоимость" }}
        ctaSecondary={{ text: "Наши услуги", href: "/uslugi/" }}
        ctaTertiary={{ text: "Смотреть цены", href: "#pricing" }}
      />

      {service.trustNumbers && service.trustNumbers.length > 0 && (
        <TrustNumbers numbers={service.trustNumbers} />
      )}

      <WhyUs
        title="Почему выбирают DanMax для вывоза кирпичного боя"
        advantages={service.advantages.map(a => ({
          title: a.title,
          description: a.description,
          icon: a.icon || "truck",
        }))}
        image="/images/why-us/kirpichnyj-boj.svg"
        imageAlt="Вывоз кирпичного боя DanMax"
      />

      <HowWeWork
        title="Как заказать вывоз кирпичного боя — 5 шагов"
        steps={steps}
      />

      <section id="pricing">
        <PricingTable
          title="Цены на вывоз кирпичного боя в Москве"
          rows={service.pricing.map(p => ({
            service: p.serviceName,
            unit: p.unit,
            price: parseInt(p.price) || 0,
          }))}
          disclaimer="Минимальный заказ — 10 м³. Точная стоимость зависит от объёма, типа кирпича и расстояния."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      <section className="py-20 bg-gray-50">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Виды кирпичного боя, которые мы вывозим
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {service.subcategories.map((sub) => (
              <Card key={sub.id} href={`/uslugi/kirpichnyj-boj/${sub.slug}/`}>
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
                      {badge.value}
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
        title="Рассчитайте стоимость вывоза кирпичного боя онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости вывоза и утилизации"
        preselectedService="kirpichnyj-boj"
        variant="embedded"
      />

      <CasesSection
        title="Наши проекты по вывозу кирпичного боя"
        cases={(service.cases || []).map((c) => ({
          title: c.title,
          image: c.image || "",
          volume: c.volume || "",
          duration: c.duration || "",
          serviceType: c.serviceId || "",
          description: c.description || undefined,
        }))}
        clients={clients}
      />

      <FaqSection
        title="Частые вопросы о вывозе кирпичного боя"
        items={service.faqItems.map(f => ({
          question: f.question,
          answer: f.answer,
        }))}
      />

      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        preselectedService="Кирпичный бой"
        variant="full"
      />
    </>
  );
}
