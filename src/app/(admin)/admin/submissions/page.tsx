import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Eye, Archive, Phone, Mail } from "lucide-react"

export default async function AdminSubmissionsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const submissions = await prisma.formSubmission.findMany({
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: submissions.length,
    new: submissions.filter((s) => !s.isRead).length,
    archived: submissions.filter((s) => s.isArchived).length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Заявки с сайта</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управление заявками от клиентов
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Всего</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Новые</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.new}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Архив</p>
          <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Услуга
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Комментарий
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Дата
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                className={`${!submission.isRead ? "bg-yellow-50" : ""} hover:bg-gray-50`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {submission.name}
                    </p>
                    <div className="mt-1 flex items-center space-x-3">
                      <a
                        href={`tel:${submission.phone}`}
                        className="flex items-center text-xs text-primary-600 hover:text-primary-900"
                      >
                        <Phone className="mr-1 h-3 w-3" />
                        {submission.phone}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {submission.serviceType || "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="max-w-md truncate text-sm text-gray-500">
                    {submission.comment || "—"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        submission.isRead
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {submission.isRead ? "Прочитано" : "Новое"}
                    </span>
                    {submission.isArchived && (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                        Архив
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <time
                    className="text-sm text-gray-500"
                    dateTime={submission.createdAt.toISOString()}
                  >
                    {format(submission.createdAt, "dd MMM yyyy, HH:mm", {
                      locale: ru,
                    })}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">Заявок пока нет</p>
          </div>
        )}
      </div>
    </div>
  )
}
