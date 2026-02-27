import Link from "next/link";
import type { BlogPost } from "@/types";

interface RelatedPostsProps {
  posts: BlogPost[];
  currentSlug: string;
  title?: string;
}

export function RelatedPosts({ posts, currentSlug, title = "Похожие статьи" }: RelatedPostsProps) {
  // Берём 3 статьи, исключая текущую
  const relatedPosts = posts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Изображение-placeholder */}
                <div className="relative h-40 bg-gray-200">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-10 h-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                </div>

                {/* Контент */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center text-primary-500 font-medium text-sm group-hover:text-primary-700 transition-colors">
                    Читать
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
