import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import Link from "next/link"
import { Eye, Archive } from "lucide-react"

export async function RecentSubmissions() {
  const submissions = await prisma.formSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  if (submissions.length === 0) {
    return (
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-900">Последние заявки</h2>
        <p className="mt-2 text-sm text-gray-500">Заявок пока нет</p>
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Последние заявки</h2>
        <Link
          href="/admin/submissions"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Смотреть все →
        </Link>
      </div>

      <ul className="divide-y divide-gray-200">
        {submissions.map((submission) => (
          <li key={submission.id}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {submission.name}
                  </p>
                  <p className="text-sm text-gray-500">{submission.phone}</p>
                  {submission.serviceType && (
                    <p className="mt-1 text-xs text-gray-400">
                      Услуга: {submission.serviceType}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      submission.isRead
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {submission.isRead ? "Прочитано" : "Новое"}
                  </span>
                  <time
                    className="text-xs text-gray-500"
                    dateTime={submission.createdAt.toISOString()}
                  >
                    {format(submission.createdAt, "dd MMMM yyyy", { locale: ru })}
                  </time>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
