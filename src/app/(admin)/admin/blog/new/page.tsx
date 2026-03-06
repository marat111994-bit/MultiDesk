import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { BlogForm } from "@/components/admin/BlogForm"

export default async function AdminNewBlogPostPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Новая статья</h1>
        <p className="mt-1 text-sm text-gray-500">
          Написание статьи для блога
        </p>
      </div>
      <BlogForm />
    </div>
  )
}
