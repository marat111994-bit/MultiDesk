import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
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
} from "@/components/sections"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { getServiceBySlug } from "@/lib/data"
import { steps } from "@/data/steps"
import { clients } from "@/data"

const SERVICE_SLUG = "asfaltnyj-boj"

export async function generateStaticParams() {
  return [{ serviceSlug: SERVICE_SLUG }]
}

export default async function Page() {
  const service = await getServiceBySlug(SERVICE_SLUG)

  if (!service) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Услуги", href: "/uslugi/" },
    { label: service.shortTitle || service.title },
  ]

  return (
    <>
      <Container>
        <Breadcrumbs items={breadcrumbs} />
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

      {service.advantages.length > 0 && (
        <WhyUs
          title={`Почему выбирают DanMax для ${service.title.toLowerCase()}`}
          advantages={service.advantages.map(a => ({
            title: a.title,
            description: a.description,
            icon: a.icon || "truck",
          }))}
          image={`/images/why-us/${SERVICE_SLUG}.svg`}
          imageAlt={service.title}
        />
      )}

      <HowWeWork
        title={`Как заказать — 5 шагов`}
        steps={steps}
      />

      {service.pricing.length > 0 && (
        <section id="pricing">
          <PricingTable
            title="Цены"
            rows={service.pricing.map(p => ({
              service: p.serviceName,
              unit: p.unit,
              price: parseInt(p.price) || 0,
            }))}
            ctaText="Заказать"
          />
        </section>
      )}

      {service.subcategories.length > 0 && (
        <section className="py-20 bg-gray-50">
          <Container>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
              Виды услуг, которые мы оказываем
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {service.subcategories.map((sub) => (
                <Card key={sub.id} href={`/uslugi/${SERVICE_SLUG}/${sub.slug}/`}>
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
      )}

      <CalculatorEmbed
        title="Рассчитайте стоимость онлайн"
        subtitle="Онлайн-калькулятор для расчёта стоимости"
        preselectedService={SERVICE_SLUG}
        variant="embedded"
      />

      {service.cases && service.cases.length > 0 && (
        <CasesSection
          title={`Наши проекты`}
          cases={service.cases.map((c) => ({
            title: c.title,
            image: c.image || "",
            volume: c.volume || "",
            duration: c.duration || "",
            serviceType: c.serviceId || "",
            description: c.description || undefined,
          }))}
          clients={clients}
        />
      )}

      {service.faqItems.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <FaqSection
              title="Частые вопросы"
              items={service.faqItems.map(f => ({
                question: f.question,
                answer: f.answer,
              }))}
            />
          </Container>
        </section>
      )}

      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        preselectedService={service.title}
        variant="full"
      />
    </>
  )
}
