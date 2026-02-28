import Link from "next/link";
import type { BlogPost } from "@/types";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Изображение-placeholder */}
        <div className="relative h-48 bg-gray-200">
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
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
        <div className="p-6">
          {/* Теги */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Заголовок */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {post.title}
          </h3>

          {/* Описание */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {post.description}
          </p>

          {/* Мета */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(post.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>{post.readingTime}</span>
          </div>

          {/* Читать далее */}
          <div className="mt-4 flex items-center text-primary-500 font-medium text-sm group-hover:text-primary-700 transition-colors">
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
  );
}
