import Link from "next/link"
import { FileText, FolderOpen, Briefcase, Inbox } from "lucide-react"

interface DashboardStatsProps {
  services: number
  blogPosts: number
  cases: number
  unreadSubmissions: number
}

export function DashboardStats({
  services,
  blogPosts,
  cases,
  unreadSubmissions,
}: DashboardStatsProps) {
  const stats = [
    {
      name: "Услуги",
      value: services,
      href: "/admin/services",
      icon: FolderOpen,
      bg: "bg-blue-500",
    },
    {
      name: "Статьи",
      value: blogPosts,
      href: "/admin/blog",
      icon: FileText,
      bg: "bg-green-500",
    },
    {
      name: "Кейсы",
      value: cases,
      href: "/admin/cases",
      icon: Briefcase,
      bg: "bg-purple-500",
    },
    {
      name: "Новые заявки",
      value: unreadSubmissions,
      href: "/admin/submissions",
      icon: Inbox,
      bg: "bg-yellow-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link
          key={stat.name}
          href={stat.href}
          className="relative overflow-hidden rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <dt>
            <div
              className={`absolute rounded-md ${stat.bg} p-3`}
            >
              <stat.icon className="h-6 w-6 text-white shrink-0" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </Link>
      ))}
    </div>
  )
}
