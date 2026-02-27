import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/container";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Блог DanMax — Статьи о вывозе и утилизации отходов",
  description:
    "Экспертные статьи о вывозе и утилизации строительных отходов. ФККО, паспорта отходов, лицензии, цены. Актуальная информация 2025 года.",
  openGraph: {
    title: "Блог | DanMax",
    description: "Статьи об утилизации отходов",
    url: "https://danmax.moscow/blog/",
    siteName: "DanMax",
    locale: "ru_RU",
    type: "website",
  },
  alternates: {
    canonical: "https://danmax.moscow/blog/",
  },
};

export default function BlogPage() {
  return (
    <>
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Блог" },
          ]}
        />
      </Container>

      {/* Заголовок */}
      <section className="py-12 bg-gray-50">
        <Container>
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Блог DanMax
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
            Экспертные статьи о вывозе и утилизации строительных отходов.
            ФККО, документация, лицензии — актуальная информация 2025 года.
          </p>
        </Container>
      </section>

      {/* Сетка статей */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
