import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/container";
import {
  HeroSection,
  TrustNumbers,
  WhyUs,
  HowWeWork,
  CasesSection,
  ContactForm,
} from "@/components/sections";
import { whyUs, steps, cases, clients } from "@/data";

export const metadata: Metadata = {
  title: "О компании DanMax — Вывоз и утилизация отходов в Москве",
  description:
    "DanMax — профессиональный вывоз и утилизация строительных отходов в Москве и МО. 12+ лет опыта, собственный автопарк, все лицензии 1–5 класс.",
  openGraph: {
    title: "О компании | DanMax",
    description: "Профессиональный вывоз и утилизация отходов в Москве",
    url: "https://danmax.moscow/o-kompanii/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/o-kompanii/",
  },
};

const extendedTrustNumbers = [
  { value: 12, suffix: "+", label: "Лет на рынке", icon: "award" },
  { value: 3500, suffix: "+", label: "Рейсов в месяц", icon: "truck" },
  { value: 98, suffix: "%", label: "Доставок в срок", icon: "clock" },
  { value: 120, suffix: "+", label: "Единиц техники", icon: "truck" },
  { value: 15000, suffix: "+", label: "Довольных клиентов", icon: "users" },
  { value: 100, suffix: "%", label: "Легальная утилизация", icon: "shield-check" },
];

export default function OKompaniiPage() {
  return (
    <>
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "О компании" },
          ]}
        />
      </Container>

      <HeroSection
        variant="about"
        title="DanMax — ваш надёжный партнёр в утилизации отходов"
        subtitle="Профессиональный вывоз и утилизация строительных отходов в Москве и Московской области с 2012 года"
        image="/images/o-kompanii/hero.jpg"
        imageAlt="Команда DanMax"
      />

      <TrustNumbers numbers={extendedTrustNumbers} />

      {/* О компании */}
      <section className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              О компании DanMax
            </h2>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Компания <strong>DanMax</strong> работает на рынке вывоза и утилизации строительных отходов с 2012 года. За 12 лет мы выросли из небольшой команды в крупного игрока отрасли с собственным автопарком из 120+ единиц техники и лицензией на обращение с отходами I–V классов опасности.
              </p>
              <p>
                Наша миссия — сделать утилизацию строительных отходов простой, прозрачной и экологичной для каждого клиента. Мы не просто вывозим мусор — мы обеспечиваем полный цикл: от сбора и транспортировки до сортировки, переработки и захоронения на лицензированных полигонах.
              </p>
              <p>
                <strong>Наши принципы:</strong> честность с клиентами, соблюдение сроков, прозрачное ценообразование и ответственность за экологию. 95% вывезенных нами отходов проходят сортировку и переработку, что снижает нагрузку на полигоны и сохраняет природу.
              </p>
              <p>
                За годы работы мы реализовали более 15 000 проектов — от вывоза грунта при строительстве частного дома до комплексной утилизации отходов при сносе промышленных объектов. Нам доверяют крупные застройщики (ПИК, Донстрой, Самолёт), дорожные компании и промышленные предприятия.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <WhyUs
        title="Почему выбирают DanMax"
        advantages={whyUs}
        image="/images/o-kompanii/team.jpg"
        imageAlt="Команда DanMax за работой"
      />

      <HowWeWork
        title="Как мы работаем — 5 простых шагов"
        steps={steps}
      />

      <CasesSection
        title="Наши проекты"
        cases={cases}
        clients={clients}
      />

      <ContactForm
        title="Свяжитесь с нами"
        subtitle="Оставьте заявку — перезвоним в течение 15 минут и ответим на все вопросы"
        variant="full"
      />
    </>
  );
}
