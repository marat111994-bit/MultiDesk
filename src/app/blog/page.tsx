import { Container } from "@/components/container"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { BlogCard } from "@/components/blog"
import { getBlogPosts } from "@/lib/data"

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <>
      <Container>
        <Breadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Блог" },
        ]} />
      </Container>

      <Container className="py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Блог</h1>
        <p className="text-lg text-gray-600 mb-12">
          Статьи о вывозе и утилизации строительных отходов, законодательстве, ФККО
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              post={{
                ...post,
                slug: post.slug,
                title: post.title,
                description: post.description,
                date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
                author: post.author,
                readingTime: `${post.readingTime || 5} мин`,
                tags: JSON.parse(post.tags),
                content: post.content,
              }}
            />
          ))}
        </div>
      </Container>
    </>
  )
}
