import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { getServiceBySlug, getServices } from "@/lib/data";
import { steps } from "@/data/steps";
import { cases, clients } from "@/data";

const serviceSlug = "vyvoz-grunta";

export async function generateMetadata(): Promise<Metadata> {
  const service = await getServiceBySlug(serviceSlug);
  
  if (!service) {
    return {
      title: "Услуга не найдена",
    };
  }

  return {
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.shortDescription,
    openGraph: {
      title: service.seoTitle || service.title,
      description: service.seoDescription || service.shortDescription,
      url: `https://danmax.moscow/uslugi/${service.slug}/`,
      siteName: "DanMax",
      locale: "ru_RU",
      type: "website",
      images: [
        {
          url: service.heroImage || "/images/placeholder.svg",
          alt: service.heroImageAlt || service.title,
        },
      ],
    },
    alternates: {
      canonical: `https://danmax.moscow/uslugi/${service.slug}/`,
    },
  };
}

export default async function VyvozGruntaPage() {
  const service = await getServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

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
        title={service.seoH1 || service.title}
        subtitle={service.shortDescription}
        image={service.heroImage || "/images/placeholder-hero.svg"}
        imageAlt={service.heroImageAlt || service.title}
        badges={service.badges ? JSON.parse(service.badges) : []}
        ctaPrimary={{ text: "Рассчитать стоимость" }}
        ctaSecondary={{ text: "Наши услуги", href: "/uslugi/" }}
        ctaTertiary={{ text: "Смотреть цены", href: "#pricing" }}
      />

      {/* Trust Numbers */}
      <TrustNumbers numbers={[
        { value: 12, suffix: "+", label: "Лет на рынке", icon: "award" },
        { value: 3500, suffix: "+", label: "Рейсов в месяц", icon: "truck" },
        { value: 98, suffix: "%", label: "Доставок в срок", icon: "clock" },
        { value: 120, suffix: "+", label: "Единиц техники", icon: "truck" },
      ]} />

      {/* Why Us */}
      {service.advantages && service.advantages.length > 0 && (
        <WhyUs
          title="Почему выбирают DanMax для вывоза грунта"
          advantages={service.advantages.map(a => ({
            title: a.title,
            description: a.description,
            icon: a.icon || "truck",
          }))}
          image="/images/placeholder.svg"
          imageAlt="Команда DanMax"
        />
      )}

      {/* How We Work */}
      <HowWeWork
        title="Как заказать вывоз грунта — 5 шагов"
        steps={steps}
      />

      {/* Pricing Table */}
      <section id="pricing">
        <PricingTable
          title="Цены на вывоз грунта в Москве"
          rows={service.pricing.map(p => ({
            serviceName: p.serviceName,
            unit: p.unit,
            price: p.price,
            order: p.order,
          }))}
          disclaimer="Минимальный заказ — 10 м³. Точная стоимость зависит от объёма, типа грунта и расстояния."
          ctaText="Рассчитать точную стоимость"
        />
      </section>

      {/* Подкатегории */}
      {service.subcategories && service.subcategories.length > 0 && (
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
                    {(sub.badges ? JSON.parse(sub.badges) : []).slice(0, 2).map((badge: string, i: number) => (
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
      )}

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
        cases={cases.filter((c) => c.serviceType === "vyvoz-grunta").map(c => ({
          title: c.title,
          image: c.image || "",
          volume: c.volume || "",
          duration: c.duration || "",
          serviceType: "ground",
          description: c.description,
        }))}
        clients={clients.map(c => ({
          name: c.name,
          logo: c.logo || "",
        }))}
        filterByService="vyvoz-grunta"
      />

      {/* FAQ Section */}
      {service.faqItems && service.faqItems.length > 0 && (
        <FaqSection
          title="Частые вопросы о вывозе грунта"
          items={service.faqItems.map(f => ({
            question: f.question,
            answer: f.answer,
            order: f.order,
          }))}
        />
      )}

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
