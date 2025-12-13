'use client'

import { useState } from 'react'

export interface CartItem {
  productId: number
  name: string
  price: number
  image?: string
  quantity: number
  notes?: string
}

interface CartProps {
  items: CartItem[]
  onUpdateItem: (productId: number, updates: Partial<CartItem>) => void
  onRemoveItem: (productId: number) => void
  onCheckout: () => void
  isOpen: boolean
  onClose: () => void
}

export default function Cart({
  items,
  onUpdateItem,
  onRemoveItem,
  onCheckout,
  isOpen,
  onClose,
}: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto md:bottom-auto md:left-auto md:right-4 md:top-20 md:max-w-md md:rounded-lg md:max-h-[70vh]">
        <div className="sticky top-0 bg-red-strong text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Carrinho</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-gold transition"
            aria-label="Fechar carrinho"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Seu carrinho está vazio</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                  >
                    <div className="flex gap-3 mb-2">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black-dark text-sm sm:text-base break-words">
                          {item.name}
                        </h3>
                        <p className="text-red-strong font-semibold text-sm">
                          MT {item.price.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {/* Quantidade */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-black-dark font-semibold">Quantidade:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              onUpdateItem(item.productId, { quantity: item.quantity - 1 })
                            } else {
                              onRemoveItem(item.productId)
                            }
                          }}
                          className="bg-red-strong text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-dark transition"
                          aria-label="Diminuir quantidade"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-black-dark font-bold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateItem(item.productId, { quantity: item.quantity + 1 })}
                          className="bg-red-strong text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-dark transition"
                          aria-label="Aumentar quantidade"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Notas/Observações */}
                    <div className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Notas/Observações (opcional)
                      </label>
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => {
                          const notes = e.target.value
                          if (notes.length <= 200) {
                            onUpdateItem(item.productId, { notes })
                          }
                        }}
                        placeholder="Ex: Sem cebola, bem passado..."
                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong resize-none"
                        rows={2}
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {(item.notes?.length || 0)}/200
                      </p>
                    </div>

                    {/* Remover */}
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-red-strong text-sm font-semibold hover:text-red-dark transition"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-black-dark">Total:</span>
                  <span className="text-2xl font-bold text-red-strong">
                    MT {total.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={onCheckout}
                className="w-full bg-red-strong text-white py-3 rounded-lg font-bold text-lg hover:bg-red-dark transition"
              >
                Finalizar Pedido
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

