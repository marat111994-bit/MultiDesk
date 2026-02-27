import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ServiceForm } from "@/components/admin/ServiceForm"

export default async function AdminNewServicePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Новая услуга</h1>
        <p className="mt-1 text-sm text-gray-500">
          Создание новой услуги
        </p>
      </div>
      <ServiceForm />
    </div>
  )
}
