import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { HeroSection, PricingTable, FaqSection } from "@/components/sections"
import { getSubcategoryBySlug } from "@/lib/data"

const SERVICE_SLUG = "betonnyj-boj"
const SUBCATEGORY_SLUG = "stroitelnye-smesi-zagryaznennyj-beton"

export async function generateStaticParams() {
  return [{ serviceSlug: SERVICE_SLUG, subcategorySlug: SUBCATEGORY_SLUG }]
}

export default async function Page() {
  const subcategory = await getSubcategoryBySlug(SERVICE_SLUG, SUBCATEGORY_SLUG)

  if (!subcategory) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Услуги", href: "/uslugi/" },
    { label: subcategory.service.title, href: `/uslugi/${SERVICE_SLUG}/` },
    { label: subcategory.title },
  ]

  return (
    <>
      <Container>
        <Breadcrumbs items={breadcrumbs} />
      </Container>

      <HeroSection
        variant="service"
        title={subcategory.seoH1 || subcategory.title}
        subtitle={subcategory.shortDescription}
        image={subcategory.heroImage || undefined}
        imageAlt={subcategory.heroImageAlt || undefined}
        badges={subcategory.badges}
        topBadge={subcategory.topBadge}
        ctaPrimary={{ text: "Заказать" }}
      />

      <section className="py-12">
        <Container>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: subcategory.description }}
          />
        </Container>
      </section>

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

      {subcategory.pricing.length > 0 && (
        <section id="pricing">
          <PricingTable
            title="Цены"
            rows={subcategory.pricing.map(p => ({
              service: p.serviceName,
              unit: p.unit,
              price: parseInt(p.price) || 0,
            }))}
            ctaText="Заказать"
          />
        </section>
      )}

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
