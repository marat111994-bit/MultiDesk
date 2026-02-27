import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { HeroSection, PricingTable, FaqSection, WhyUs } from "@/components/sections"
import { getServiceBySlug } from "@/lib/data"

interface ServicePageProps {
  params: Promise<{ serviceSlug: string }>
}

export async function generateStaticParams() {
  const { getServices } = await import("@/lib/data")
  const services = await getServices()
  
  return services.map((service) => ({
    serviceSlug: service.slug,
  }))
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { serviceSlug } = await params
  const service = await getServiceBySlug(serviceSlug)

  if (!service) {
    notFound()
  }

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Главная", href: "/" },
    { label: "Услуги", href: "/uslugi/" },
    { label: service.title },
  ]

  return (
    <>
      <Container>
        <Breadcrumbs items={breadcrumbs} />
      </Container>

      <HeroSection
        variant="service"
        title={service.title}
        subtitle={service.shortDescription}
        image={service.heroImage || undefined}
        imageAlt={service.heroImageAlt || undefined}
        badges={JSON.parse(service.badges)}
        ctaPrimary={{ text: "Заказать услугу" }}
        ctaSecondary={{ text: "Наши цены", href: "#pricing" }}
      />

      {/* Subcategories */}
      {service.subcategories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Подкатегории
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.subcategories.map((sub) => (
                <a
                  key={sub.slug}
                  href={`/uslugi/${service.slug}/${sub.slug}`}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {sub.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {sub.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {JSON.parse(sub.badges).map((badge: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-primary-600">
                    Подробнее →
                  </span>
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Content */}
      <section className="py-12">
        <Container>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        </Container>
      </section>

      {/* Pricing */}
      {service.pricing.length > 0 && (
        <section id="pricing" className="py-12">
          <Container>
            <PricingTable
              title="Цены"
              rows={service.pricing.map(p => ({
                service: p.serviceName,
                unit: p.unit,
                price: parseInt(p.price) || 0,
              }))}
              ctaText="Заказать"
            />
          </Container>
        </section>
      )}

      {/* Advantages */}
      {service.advantages.length > 0 && (
        <WhyUs
          title="Преимущества"
          advantages={service.advantages.map(a => ({
            title: a.title,
            description: a.description,
            icon: a.icon || "truck",
          }))}
          image="/images/why-us/home.jpg"
          imageAlt="Команда DanMax"
        />
      )}

      {/* FAQ */}
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
    </>
  )
}
