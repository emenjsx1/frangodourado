'use client'

import { useState } from 'react'

interface ExportReportsProps {
  type: 'financial' | 'customers'
  startDate?: string
  endDate?: string
}

export default function ExportReports({ type, startDate, endDate }: ExportReportsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [exportStartDate, setExportStartDate] = useState(startDate || '')
  const [exportEndDate, setExportEndDate] = useState(endDate || '')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      if (exportStartDate) params.append('startDate', exportStartDate)
      if (exportEndDate) params.append('endDate', exportEndDate)

      const endpoint =
        type === 'financial' ? '/api/reports/financial' : '/api/reports/customers'
      const url = `${endpoint}?${params.toString()}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl

      const extension = format === 'excel' ? 'xlsx' : 'pdf'
      const filename = `relatorio-${type}-${Date.now()}.${extension}`
      link.download = filename

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      setIsOpen(false)
      alert('Relatório exportado com sucesso!')
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Erro ao exportar relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
      >
        📊 Exportar Relatório
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 border-2 border-red-dark"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-black-dark mb-4">
              Exportar Relatório {type === 'financial' ? 'Financeiro' : 'de Clientes'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black-dark mb-2">
                  Formato
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="pdf"
                      checked={format === 'pdf'}
                      onChange={e => setFormat(e.target.value as 'pdf' | 'excel')}
                    />
                    <span className="text-black-dark">PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="excel"
                      checked={format === 'excel'}
                      onChange={e => setFormat(e.target.value as 'pdf' | 'excel')}
                    />
                    <span className="text-black-dark">Excel</span>
                  </label>
                </div>
              </div>

              {type === 'financial' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-black-dark mb-2">
                      Data Inicial (opcional)
                    </label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={e => setExportStartDate(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-red-dark rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black-dark mb-2">
                      Data Final (opcional)
                    </label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={e => setExportEndDate(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-red-dark rounded-lg text-sm"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="flex-1 bg-red-strong text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-dark transition disabled:opacity-50"
                >
                  {loading ? 'Gerando...' : 'Exportar'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-black-dark px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

