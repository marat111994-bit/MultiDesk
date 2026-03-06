import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceForm } from "@/components/admin/ServiceForm"

interface EditServicePageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditServicePage({ params }: EditServicePageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session) {
    redirect("/admin/login")
  }

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      subcategories: {
        include: {
          fkkoItems: true,
          pricing: true,
          faqItems: true,
          advantages: true,
        },
      },
      pricing: true,
      faqItems: true,
      advantages: true,
    },
  })

  if (!service) {
    redirect("/admin/services")
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Редактирование услуги</h1>
        <p className="mt-1 text-sm text-gray-500">
          {service.title}
        </p>
      </div>
      <ServiceForm initialData={service} serviceId={id} />
    </div>
  )
}
