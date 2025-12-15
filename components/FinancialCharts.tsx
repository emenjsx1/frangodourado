'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { RevenueDataPoint, PaymentMethodData, ProductSalesData } from '@/lib/analytics'

interface FinancialChartsProps {
  revenueData: RevenueDataPoint[]
  paymentData: PaymentMethodData[]
  topProducts: ProductSalesData[]
}

const COLORS = ['#700F12', '#953834', '#A17A0E', '#45362E', '#D5DAD5', '#C0BDAD']

export default function FinancialCharts({
  revenueData,
  paymentData,
  topProducts,
}: FinancialChartsProps) {
  return (
    <div className="space-y-6">
      {/* Gráfico de Receita ao Longo do Tempo */}
      <div className="bg-white p-4 rounded-lg border-2 border-red-dark">
        <h3 className="text-lg font-bold text-black-dark mb-4">Receita ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [`MT ${value.toFixed(0)}`, 'Receita']}
              labelStyle={{ color: '#45362E' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#700F12"
              strokeWidth={2}
              name="Receita (MT)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Distribuição por Método de Pagamento */}
        <div className="bg-white p-4 rounded-lg border-2 border-red-dark">
          <h3 className="text-lg font-bold text-black-dark mb-4">
            Distribuição por Método de Pagamento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `MT ${value.toFixed(0)}`}
                labelStyle={{ color: '#45362E' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentData.map((item, index) => (
              <div key={item.method} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-black-dark">{item.method}</span>
                </div>
                <span className="font-semibold text-black-dark">
                  MT {item.amount.toFixed(0)} ({item.count} pedidos)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Produtos Mais Vendidos */}
        <div className="bg-white p-4 rounded-lg border-2 border-red-dark">
          <h3 className="text-lg font-bold text-black-dark mb-4">Top 10 Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="productName"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [value, 'Quantidade']}
                labelStyle={{ color: '#45362E' }}
              />
              <Legend />
              <Bar dataKey="quantity" fill="#700F12" name="Quantidade Vendida" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

