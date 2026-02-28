import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Pencil, Trash2, Plus } from "lucide-react"

export default async function AdminCasesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const cases = await prisma.case.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Кейсы</h1>
          <p className="mt-1 text-sm text-gray-500">
            Примеры выполненных работ
          </p>
        </div>
        <Link
          href="/admin/cases/new"
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить кейс
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Изображение
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Объём
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Длительность
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {cases.map((caseItem) => (
              <tr key={caseItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {caseItem.image ? (
                    <img
                      src={caseItem.image}
                      alt={caseItem.imageAlt || ""}
                      className="h-16 w-24 object-cover rounded"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded bg-gray-200 text-gray-400">
                      <span className="text-xs">Нет фото</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {caseItem.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{caseItem.volume || "—"}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{caseItem.duration || "—"}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      caseItem.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {caseItem.isActive ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/cases/${caseItem.id}/edit`}
                    className="mr-3 text-primary-600 hover:text-primary-900"
                  >
                    <Pencil className="inline h-4 w-4" />
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="inline h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
