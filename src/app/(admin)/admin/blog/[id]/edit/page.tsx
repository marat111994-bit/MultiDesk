import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BlogForm } from "@/components/admin/BlogForm"

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditBlogPostPage({ params }: EditBlogPostPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session) {
    redirect("/admin/login")
  }

  const post = await prisma.blogPost.findUnique({
    where: { id },
  })

  if (!post) {
    redirect("/admin/blog")
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Редактирование статьи</h1>
        <p className="mt-1 text-sm text-gray-500">
          {post.title}
        </p>
      </div>
      <BlogForm initialData={post} postId={id} />
    </div>
  )
}
