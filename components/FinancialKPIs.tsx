'use client'

interface FinancialKPIsProps {
  totalRevenue: number
  previousPeriodRevenue: number
  averageTicket: number
  ordersPerDay: number
  approvalRate: number
  averagePreparationTime: number
  cancellationRate: number
  uniqueCustomers: number
}

export default function FinancialKPIs({
  totalRevenue,
  previousPeriodRevenue,
  averageTicket,
  ordersPerDay,
  approvalRate,
  averagePreparationTime,
  cancellationRate,
  uniqueCustomers,
}: FinancialKPIsProps) {
  const growthRate =
    previousPeriodRevenue > 0
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black-dark">Indicadores Principais (KPIs)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className="p-4 border-2 border-green-600 rounded-lg bg-green-50">
          <p className="text-sm text-green-800 font-semibold">Receita Total</p>
          <p className="text-2xl font-bold text-green-700">MT {totalRevenue.toFixed(0)}</p>
          {growthRate !== 0 && (
            <p className={`text-xs mt-1 ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate > 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}% vs período anterior
            </p>
          )}
        </div>

        {/* Crescimento */}
        <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
          <p className="text-sm text-blue-800 font-semibold">Crescimento</p>
          <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">vs período anterior</p>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 border-2 border-purple-600 rounded-lg bg-purple-50">
          <p className="text-sm text-purple-800 font-semibold">Ticket Médio</p>
          <p className="text-2xl font-bold text-purple-700">MT {averageTicket.toFixed(0)}</p>
        </div>

        {/* Pedidos por Dia */}
        <div className="p-4 border-2 border-indigo-600 rounded-lg bg-indigo-50">
          <p className="text-sm text-indigo-800 font-semibold">Pedidos/Dia</p>
          <p className="text-2xl font-bold text-indigo-700">{ordersPerDay.toFixed(1)}</p>
        </div>

        {/* Taxa de Aprovação */}
        <div className="p-4 border-2 border-teal-600 rounded-lg bg-teal-50">
          <p className="text-sm text-teal-800 font-semibold">Taxa de Aprovação</p>
          <p className="text-2xl font-bold text-teal-700">{approvalRate.toFixed(1)}%</p>
        </div>

        {/* Tempo Médio de Preparo */}
        <div className="p-4 border-2 border-orange-600 rounded-lg bg-orange-50">
          <p className="text-sm text-orange-800 font-semibold">Tempo Médio Preparo</p>
          <p className="text-2xl font-bold text-orange-700">{averagePreparationTime.toFixed(0)} min</p>
        </div>

        {/* Taxa de Cancelamento */}
        <div className="p-4 border-2 border-red-600 rounded-lg bg-red-50">
          <p className="text-sm text-red-800 font-semibold">Taxa de Cancelamento</p>
          <p className="text-2xl font-bold text-red-700">{cancellationRate.toFixed(1)}%</p>
        </div>

        {/* Clientes Únicos */}
        <div className="p-4 border-2 border-pink-600 rounded-lg bg-pink-50">
          <p className="text-sm text-pink-800 font-semibold">Clientes Únicos</p>
          <p className="text-2xl font-bold text-pink-700">{uniqueCustomers}</p>
        </div>
      </div>
    </div>
  )
}

