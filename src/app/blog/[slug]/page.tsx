import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/container";
import { HeroSection } from "@/components/sections";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { ContactForm } from "@/components/sections";
import { blogPosts } from "@/data/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Генерация статических параметров для SSG
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Генерация метаданных
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Статья не найдена | DanMax",
    };
  }

  return {
    title: `${post.title} | DanMax`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://danmax.moscow/blog/${post.slug}/`,
      siteName: "DanMax",
      locale: "ru_RU",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://danmax.moscow/blog/${post.slug}/`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Блог", href: "/blog/" },
            { label: post.title },
          ]}
        />
      </Container>

      {/* Hero Section для блога */}
      <HeroSection
        variant="blog"
        title={post.title}
        date={new Date(post.date).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        author={post.author}
        readingTime={post.readingTime}
      />

      {/* Контент статьи */}
      <article className="py-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Теги */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* HTML контент */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                prose-li:text-gray-700 prose-li:mb-2
                prose-a:text-primary-500 prose-a:underline prose-a:hover:text-primary-700
                prose-table:w-full prose-table:border-collapse prose-table:my-6
                prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-th:text-left
                prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
                prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </Container>
      </article>

      {/* Похожие статьи */}
      <RelatedPosts posts={blogPosts} currentSlug={post.slug} />

      {/* Contact Form */}
      <ContactForm
        title="Остались вопросы?"
        subtitle="Задайте вопрос эксперту — ответим в течение 15 минут"
        variant="compact"
      />
    </>
  );
}
