import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Save } from "lucide-react"

const groups = {
  contacts: "Контакты",
  company: "Компания",
  social: "Соцсети",
  promo: "Промо",
}

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const settings = await prisma.siteSetting.findMany({
    orderBy: [{ group: "asc" }, { order: "asc" }],
  })

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.group]) {
      acc[setting.group] = []
    }
    acc[setting.group].push(setting)
    return acc
  }, {} as Record<string, typeof settings>)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки сайта</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управление контактами и общей информацией
          </p>
        </div>
        <button
          form="settings-form"
          type="submit"
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Сохранить
        </button>
      </div>

      <form id="settings-form" action="/api/admin/settings" method="POST">
        <div className="space-y-6">
          {Object.entries(groups).map(([groupKey, groupLabel]) => {
            const groupSettings = groupedSettings[groupKey]
            if (!groupSettings || groupSettings.length === 0) return null

            return (
              <div key={groupKey} className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-900">
                  {groupLabel}
                </h2>
                <div className="space-y-4">
                  {groupSettings.map((setting) => (
                    <div key={setting.id}>
                      <label
                        htmlFor={setting.key}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {setting.label}
                      </label>
                      <input
                        type="text"
                        id={setting.key}
                        name={setting.key}
                        defaultValue={setting.value}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </form>
    </div>
  )
}
