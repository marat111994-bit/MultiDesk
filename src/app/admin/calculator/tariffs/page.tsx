'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

interface TransportTariff {
  distanceKm: number
  baseTariffT: number
  baseTariffM3: number
}

interface TariffConfig {
  id: number
  startKm: number
  startTariff: number
  endKm: number
  endTariff: number
  point1Km: number
  point1Tariff: number
  point2Km: number
  point2Tariff: number
  point3Km: number
  point3Tariff: number
  paramA: number | null
  paramB: number | null
  paramC: number | null
  hyperMinKm: number | null
  hyperMaxKm: number | null
  volumeCoeff: number
  marginPercent: number
  maxDistanceKm: number
}

export default function AdminCalculatorTariffsPage() {
  const [activeTab, setActiveTab] = useState<'linear' | 'hyperbolic'>('linear')

  // Линейная модель
  const [linearConfig, setLinearConfig] = useState({
    startKm: 1,
    startTariff: 50,
    endKm: 50,
    endTariff: 30,
    volumeCoeff: 1.4,
    marginPercent: 0,
    maxDistanceKm: 500,
  })
  const [linearPreview, setLinearPreview] = useState<TransportTariff[]>([])
  const [generatingLinear, setGeneratingLinear] = useState(false)

  // Гиперболическая модель
  const [hyperbolicConfig, setHyperbolicConfig] = useState({
    point1Km: 1,
    point1Tariff: 50,
    point2Km: 20,
    point2Tariff: 35,
    point3Km: 50,
    point3Tariff: 25,
    hyperMinKm: 1,
    hyperMaxKm: 100,
    volumeCoeff: 1.4,
    marginPercent: 0,
    maxDistanceKm: 500,
  })
  const [hyperbolicParams, setHyperbolicParams] = useState<{ a: number; b: number; c: number } | null>(null)
  const [hyperbolicPreview, setHyperbolicPreview] = useState<TransportTariff[]>([])
  const [generatingHyperbolic, setGeneratingHyperbolic] = useState(false)

  // Загрузка текущей конфигурации
  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/calculator/transport-tariffs/config')
      if (res.ok) {
        const config: TariffConfig = await res.json()
        setLinearConfig({
          startKm: config.startKm || 1,
          startTariff: config.startTariff || 50,
          endKm: config.endKm || 50,
          endTariff: config.endTariff || 30,
          volumeCoeff: config.volumeCoeff || 1.4,
          marginPercent: config.marginPercent || 0,
          maxDistanceKm: config.maxDistanceKm || 500,
        })
        setHyperbolicConfig({
          point1Km: config.point1Km || 1,
          point1Tariff: config.point1Tariff || 50,
          point2Km: config.point2Km || 20,
          point2Tariff: config.point2Tariff || 35,
          point3Km: config.point3Km || 50,
          point3Tariff: config.point3Tariff || 25,
          hyperMinKm: config.hyperMinKm || 1,
          hyperMaxKm: config.hyperMaxKm || 100,
          volumeCoeff: config.volumeCoeff || 1.4,
          marginPercent: config.marginPercent || 0,
          maxDistanceKm: config.maxDistanceKm || 500,
        })
        if (config.paramA && config.paramB && config.paramC) {
          setHyperbolicParams({
            a: config.paramA,
            b: config.paramB,
            c: config.paramC,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  const fetchPreview = async () => {
    try {
      const res = await fetch('/api/admin/calculator/transport-tariffs?limit=30')
      if (res.ok) {
        const data: TransportTariff[] = await res.json()
        setLinearPreview(data)
        setHyperbolicPreview(data)
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
    }
  }

  const handleGenerateLinear = async () => {
    setGeneratingLinear(true)
    try {
      const res = await fetch('/api/admin/calculator/transport-tariffs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linearConfig),
      })
      if (res.ok) {
        await fetchPreview()
        alert('Матрица тарифов успешно сгенерирована!')
      }
    } catch (error) {
      console.error('Error generating linear tariffs:', error)
      alert('Ошибка при генерации тарифов')
    } finally {
      setGeneratingLinear(false)
    }
  }

  const handleGenerateHyperbolic = async () => {
    setGeneratingHyperbolic(true)
    try {
      const res = await fetch('/api/admin/calculator/transport-tariffs/hyperbolic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hyperbolicConfig),
      })
      if (res.ok) {
        const data = await res.json()
        setHyperbolicParams(data.params)
        await fetchPreview()
        alert('Гиперболическая матрица тарифов успешно сгенерирована!')
      }
    } catch (error) {
      console.error('Error generating hyperbolic tariffs:', error)
      alert('Ошибка при генерации тарифов')
    } finally {
      setGeneratingHyperbolic(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Тарифы на перевозки</h1>
        <p className="mt-1 text-sm text-gray-500">
          Настройка и генерация матрицы тарифов
        </p>
      </div>

      {/* Табы */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('linear')}
            className={clsx(
              'border-b-2 py-4 text-sm font-medium',
              activeTab === 'linear'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            Линейная модель
          </button>
          <button
            onClick={() => setActiveTab('hyperbolic')}
            className={clsx(
              'border-b-2 py-4 text-sm font-medium',
              activeTab === 'hyperbolic'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            Гиперболическая модель
          </button>
        </nav>
      </div>

      {/* Линейная модель */}
      {activeTab === 'linear' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Параметры линейной модели</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Начальный км</label>
                <input
                  type="number"
                  value={linearConfig.startKm}
                  onChange={(e) => setLinearConfig(prev => ({ ...prev, startKm: parseInt(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Начальный тариф (₽/км)</label>
                <input
                  type="number"
                  step="0.01"
                  value={linearConfig.startTariff}
                  onChange={(e) => setLinearConfig(prev => ({ ...prev, startTariff: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Конечный км</label>
                <input
                  type="number"
                  value={linearConfig.endKm}
                  onChange={(e) => setLinearConfig(prev => ({ ...prev, endKm: parseInt(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Конечный тариф (₽/км)</label>
                <input
                  type="number"
                  step="0.01"
                  value={linearConfig.endTariff}
                  onChange={(e) => setLinearConfig(prev => ({ ...prev, endTariff: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Коэффициент объёма</label>
                <input
                  type="number"
                  step="0.1"
                  value={linearConfig.volumeCoeff}
                  onChange={(e) => setLinearConfig(prev => ({ ...prev, volumeCoeff: parseFloat(e.target.value) || 1 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Маржа (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={linearConfig.marginPercent}
                  onChange={(e) => setLinearConfig(prev => ({ ...prev, marginPercent: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Макс. расстояние (км)</label>
                <input
                  type="number"
                  value={linearConfig.maxDistanceKm}
                  onChange={(e) => setLinearConfig(prev => ({ ...prev, maxDistanceKm: parseInt(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGenerateLinear}
                disabled={generatingLinear}
                className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingLinear ? 'Генерация...' : 'Сгенерировать матрицу'}
              </button>
            </div>
          </div>

          {/* Превью */}
          {linearPreview.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Превью (первые 30 км)</h3>
              <div className="overflow-hidden rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Расстояние (км)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Базовый тариф (т)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Базовый тариф (м³)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {linearPreview.map((tariff) => (
                      <tr key={tariff.distanceKm}>
                        <td className="px-4 py-3 text-sm text-gray-900">{tariff.distanceKm}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(tariff.baseTariffT)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(tariff.baseTariffM3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Гиперболическая модель */}
      {activeTab === 'hyperbolic' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Параметры гиперболической модели</h2>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700">Три точки для расчёта гиперболы</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-900">Точка 1</h4>
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500">Расстояние (км)</label>
                      <input
                        type="number"
                        value={hyperbolicConfig.point1Km}
                        onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, point1Km: parseInt(e.target.value) || 0 }))}
                        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Тариф (₽/км)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={hyperbolicConfig.point1Tariff}
                        onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, point1Tariff: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-900">Точка 2</h4>
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500">Расстояние (км)</label>
                      <input
                        type="number"
                        value={hyperbolicConfig.point2Km}
                        onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, point2Km: parseInt(e.target.value) || 0 }))}
                        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Тариф (₽/км)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={hyperbolicConfig.point2Tariff}
                        onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, point2Tariff: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-900">Точка 3</h4>
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500">Расстояние (км)</label>
                      <input
                        type="number"
                        value={hyperbolicConfig.point3Km}
                        onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, point3Km: parseInt(e.target.value) || 0 }))}
                        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Тариф (₽/км)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={hyperbolicConfig.point3Tariff}
                        onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, point3Tariff: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Мин. км гиперболы</label>
                <input
                  type="number"
                  value={hyperbolicConfig.hyperMinKm}
                  onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, hyperMinKm: parseInt(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Макс. км гиперболы</label>
                <input
                  type="number"
                  value={hyperbolicConfig.hyperMaxKm}
                  onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, hyperMaxKm: parseInt(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Коэффициент объёма</label>
                <input
                  type="number"
                  step="0.1"
                  value={hyperbolicConfig.volumeCoeff}
                  onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, volumeCoeff: parseFloat(e.target.value) || 1 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Маржа (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hyperbolicConfig.marginPercent}
                  onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, marginPercent: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Макс. расстояние (км)</label>
                <input
                  type="number"
                  value={hyperbolicConfig.maxDistanceKm}
                  onChange={(e) => setHyperbolicConfig(prev => ({ ...prev, maxDistanceKm: parseInt(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {hyperbolicParams && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <h4 className="text-sm font-medium text-blue-900">Рассчитанные параметры гиперболы</h4>
                <p className="mt-2 text-sm text-blue-700">
                  Формула: tariff(km) = a + b / (km + c)
                </p>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">a = </span>
                    <span className="font-medium text-blue-900">{hyperbolicParams.a.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">b = </span>
                    <span className="font-medium text-blue-900">{hyperbolicParams.b.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">c = </span>
                    <span className="font-medium text-blue-900">{hyperbolicParams.c.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleGenerateHyperbolic}
                disabled={generatingHyperbolic}
                className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingHyperbolic ? 'Генерация...' : 'Рассчитать параметры и сгенерировать'}
              </button>
            </div>
          </div>

          {/* Превью */}
          {hyperbolicPreview.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Превью (первые 30 км)</h3>
              <div className="overflow-hidden rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Расстояние (км)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Базовый тариф (т)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Базовый тариф (м³)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {hyperbolicPreview.map((tariff) => (
                      <tr key={tariff.distanceKm}>
                        <td className="px-4 py-3 text-sm text-gray-900">{tariff.distanceKm}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(tariff.baseTariffT)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(tariff.baseTariffM3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
