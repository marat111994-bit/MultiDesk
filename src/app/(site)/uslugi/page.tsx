import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Услуги — Вывоз и утилизация строительных отходов | DanMax",
  description:
    "Вывоз и утилизация грунта, бетона, кирпича, асфальта, смешанных отходов в Москве и МО. Собственный автопарк, все лицензии. Рассчитайте стоимость онлайн.",
  openGraph: {
    title: "Услуги — DanMax",
    description:
      "Вывоз и утилизация строительных отходов в Москве и МО",
    url: "https://danmax.moscow/uslugi/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/",
  },
};

const servicesData = [
  {
    slug: "vyvoz-grunta",
    title: "Вывоз грунта",
    description: "Чистый, строительный, буровой шлам ГНБ, загрязнённый, дорожный грунт",
    icon: (
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    ),
  },
  {
    slug: "kirpichnyj-boj",
    title: "Кирпичный бой",
    description: "Строительный и огнеупорный кирпич от сноса и демонтажа печей",
    icon: (
      <path d="M2 22h20M2 18h20M2 14h20M2 10h20M2 6h20M6 2v20M18 2v20" />
    ),
  },
  {
    slug: "betonnyj-boj",
    title: "Бетонный бой",
    description: "Лом бетона, ЖБИ, отходы сноса, ж/б шпалы, строительные смеси",
    icon: (
      <path d="M3 3h18v18H3zM7 7h10v10H7z" />
    ),
  },
  {
    slug: "asfaltnyj-boj",
    title: "Асфальтовый бой",
    description: "Асфальтовая крошка от фрезерования и демонтажа дорог",
    icon: (
      <path d="M2 22h20M4 22V10a2 2 0 012-2h12a2 2 0 012 2v12M8 2v6M16 2v6" />
    ),
  },
  {
    slug: "smeshannye-stroitelnye-othody",
    title: "Смешанные отходы",
    description: "Разнородные отходы сноса и ремонта с сортировкой",
    icon: (
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM7.5 4.21l4.5 2.6 4.5-2.6m-9 15.58V10l9-5.2" />
    ),
  },
  {
    slug: "razreshitelnaya-dokumentaciya",
    title: "Документация",
    description: "Биотестирование, паспорт отходов, разрешение на перемещение",
    icon: (
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />
    ),
  },
];

export default function UslugiPage() {
  return (
    <>
      {/* Хлебные крошки */}
      <Container>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Услуги" }]} />
      </Container>

      {/* Заголовок */}
      <section className="py-12 bg-gray-50">
        <Container>
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Наши услуги
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
            Вывоз и утилизация всех типов строительных отходов в Москве и
            Московской области. Собственный автопарк, все лицензии 1–5 класс.
          </p>
        </Container>
      </section>

      {/* Сетка услуг */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.map((service) => (
              <Card key={service.slug} href={`/uslugi/${service.slug}/`}>
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {service.icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description}
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

      {/* Trust Numbers */}
      <section className="bg-gray-50 py-16">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-500">
                12+
              </div>
              <p className="text-sm text-gray-600 mt-2">Лет на рынке</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-500">
                3500+
              </div>
              <p className="text-sm text-gray-600 mt-2">Рейсов в месяц</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-500">
                98%
              </div>
              <p className="text-sm text-gray-600 mt-2">Доставок в срок</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-500">
                120+
              </div>
              <p className="text-sm text-gray-600 mt-2">Единиц техники</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
