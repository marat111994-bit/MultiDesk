import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { BlogCard } from "@/components/blog"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { getBlogPosts } = await import("@/lib/data")
  const posts = await getBlogPosts()
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Главная", href: "/" },
    { label: "Блог", href: "/blog/" },
    { label: post.title },
  ]

  // Получаем связанные посты
  const relatedPosts = await getBlogPosts(3)

  return (
    <>
      <Container>
        <Breadcrumbs items={breadcrumbs} />
      </Container>

      <article className="py-12">
        <Container>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{post.author}</span>
              {post.publishedAt && (
                <>
                  <span>•</span>
                  <time dateTime={post.publishedAt.toISOString()}>
                    {format(post.publishedAt, "dd MMMM yyyy", { locale: ru })}
                  </time>
                </>
              )}
              {post.readingTime && (
                <>
                  <span>•</span>
                  <span>{post.readingTime} мин</span>
                </>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8">
              <img
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="mb-8 flex flex-wrap gap-2">
              {JSON.parse(post.tags).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Container>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Читайте также
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts
                .filter(p => p.slug !== post.slug)
                .slice(0, 3)
                .map((relatedPost) => (
                  <BlogCard
                    key={relatedPost.slug}
                    post={{
                      ...relatedPost,
                      slug: relatedPost.slug,
                      title: relatedPost.title,
                      description: relatedPost.description,
                      date: relatedPost.publishedAt?.toISOString() || relatedPost.createdAt.toISOString(),
                      author: relatedPost.author,
                      readingTime: `${relatedPost.readingTime || 5} мин`,
                      tags: JSON.parse(relatedPost.tags),
                      content: relatedPost.content,
                    }}
                  />
                ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
