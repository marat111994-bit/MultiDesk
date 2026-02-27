import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { HeroSection, PricingTable, FaqSection } from "@/components/sections"
import { getSubcategoryBySlug } from "@/lib/data"

interface SubcategoryPageProps {
  params: Promise<{ serviceSlug: string; subcategorySlug: string }>
}

export async function generateStaticParams() {
  const { getServices } = await import("@/lib/data")
  const services = await getServices()
  
  const params: Array<{ serviceSlug: string; subcategorySlug: string }> = []
  
  for (const service of services) {
    for (const sub of service.subcategories) {
      params.push({
        serviceSlug: service.slug,
        subcategorySlug: sub.slug,
      })
    }
  }
  
  return params
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { serviceSlug, subcategorySlug } = await params
  const subcategory = await getSubcategoryBySlug(serviceSlug, subcategorySlug)

  if (!subcategory) {
    notFound()
  }

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Главная", href: "/" },
    { label: "Услуги", href: "/uslugi/" },
    { label: subcategory.service.title, href: `/uslugi/${serviceSlug}/` },
    { label: subcategory.title },
  ]

  return (
    <>
      <Container>
        <Breadcrumbs items={breadcrumbs} />
      </Container>

      <HeroSection
        variant="service"
        title={subcategory.title}
        subtitle={subcategory.shortDescription}
        image={subcategory.heroImage || undefined}
        imageAlt={subcategory.heroImageAlt || undefined}
        badges={JSON.parse(subcategory.badges)}
        ctaPrimary={{ text: "Заказать" }}
      />

      {/* Content */}
      <section className="py-12">
        <Container>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: subcategory.description }}
          />
        </Container>
      </section>

      {/* FKKO */}
      {subcategory.fkkoItems.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">ФККО</h2>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Код</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Наименование</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Класс</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {subcategory.fkkoItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{item.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                          item.hazardClass === 1 ? 'bg-red-100 text-red-800' :
                          item.hazardClass === 2 ? 'bg-orange-100 text-orange-800' :
                          item.hazardClass === 3 ? 'bg-yellow-100 text-yellow-800' :
                          item.hazardClass === 4 ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.hazardClass} класс
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {/* Pricing */}
      {subcategory.pricing.length > 0 && (
        <section id="pricing" className="py-12">
          <Container>
            <PricingTable
              title="Цены"
              rows={subcategory.pricing.map(p => ({
                service: p.serviceName,
                unit: p.unit,
                price: parseInt(p.price) || 0,
              }))}
              ctaText="Заказать"
            />
          </Container>
        </section>
      )}

      {/* FAQ */}
      {subcategory.faqItems.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <FaqSection
              title="Частые вопросы"
              items={subcategory.faqItems.map(f => ({
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
