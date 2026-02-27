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
import { razreshitelnayaDokumentaciya } from "@/data/services/razreshitelnaya-dokumentaciya";
import { steps } from "@/data/steps";
import { clients } from "@/data";

const subcategory = razreshitelnayaDokumentaciya.subcategories.find(
  (s) => s.id === "razreshenije-na-peremeshhenije"
)!;

export const metadata: Metadata = {
  title: subcategory.seo.title,
  description: subcategory.seo.description,
  openGraph: {
    title: subcategory.seo.title,
    description: subcategory.seo.description,
    url: "https://danmax.moscow/uslugi/razreshitelnaya-dokumentaciya/razreshenije-na-peremeshhenije/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/uslugi/razreshitelnaya-dokumentaciya/razreshenije-na-peremeshhenije/",
  },
};

export default function RazreshenijeNaPeremeshhenijePage() {
  const relatedSubcategories = razreshitelnayaDokumentaciya.subcategories.filter((s) =>
    subcategory.relatedSubcategories.includes(s.id)
  );

  return (
    <>
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/uslugi/" },
            { label: "Документация", href: "/uslugi/razreshitelnaya-dokumentaciya/" },
            { label: subcategory.shortTitle },
          ]}
        />
      </Container>

      <HeroSection
        variant="service"
        title={subcategory.seo.h1}
        subtitle={subcategory.shortDescription}
        image={subcategory.heroImage}
        imageAlt={subcategory.heroImageAlt}
        badges={subcategory.badges}
        ctaPrimary={{ text: "Заказать разрешение" }}
        ctaSecondary={{ text: "Наши услуги", href: "/uslugi/" }}
        ctaTertiary={{ text: "Смотреть цены", href: "#pricing" }}
      />

      <TrustNumbers numbers={subcategory.trustNumbers} />

      <WhyUs
        title="Почему выбирают DanMax для оформления разрешения"
        advantages={subcategory.advantages}
        image="/images/why-us/razreshenije.jpg"
        imageAlt="Разрешение на перемещение"
      />

      <HowWeWork
        title="Как заказать разрешение на перемещение — 5 шагов"
        steps={steps}
      />

      <section id="pricing">
        <PricingTable
          title="Цены на оформление разрешения на перемещение"
          rows={subcategory.pricing}
          disclaimer="Срок оформления: 10–15 рабочих дней."
          ctaText="Заказать разрешение"
        />
      </section>

      <CalculatorEmbed
        title="Рассчитайте стоимость оформления разрешения"
        subtitle="Онлайн-калькулятор для расчёта стоимости услуг"
        preselectedService="razreshenije-na-peremeshhenije"
        variant="embedded"
      />

      {/* Смежные услуги */}
      <section className="py-20 bg-gray-50">
        <Container>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Смежные услуги
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {relatedSubcategories.map((sub) => (
              <Card key={sub.id} href={`/uslugi/razreshitelnaya-dokumentaciya/${sub.slug}/`}>
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

      <CasesSection
        title="Наши проекты по оформлению разрешений"
        cases={[]}
        clients={clients}
      />

      <FaqSection
        title="Частые вопросы о разрешении на перемещение"
        items={subcategory.faq}
      />

      <ContactForm
        title="Оставьте заявку — рассчитаем стоимость за 15 минут"
        subtitle="Перезвоним в течение 15 минут, ответим на вопросы и рассчитаем точную стоимость"
        preselectedService="Разрешение на перемещение"
        variant="full"
      />
    </>
  );
}
