'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import * as QRCode from 'qrcode'
import StarRating from '@/components/StarRating'

interface Store {
  id: number
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email?: string
  facebookUrl?: string
  instagramUrl?: string
  whatsappUrl?: string
  appUrl?: string
  categories: Category[]
  products: Product[]
}

interface Category {
  id: number
  name: string
  description?: string
  orderPosition: number
}

interface Product {
  id: number
  name: string
  description?: string
  price: number
  image?: string
  isAvailable: boolean
  isHot?: boolean
  category: Category
  categoryId: number
}

// Helper function para formatar datas de forma consistente
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export default function DashboardContent({ session }: { session: any }) {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'reviews'>('categories')

  useEffect(() => {
    fetchStore()
  }, [])

  useEffect(() => {
    if (store) {
      generateQRCode()
    }
  }, [store])

  const fetchStore = async () => {
    try {
      const res = await fetch('/api/stores')
      if (res.ok) {
        const data = await res.json()
        setStore(data)
      }
    } catch (err) {
      console.error('Error fetching store:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    if (!store) return
    
    try {
      const cardapioUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/loja/${store.slug}`
      const qr = await QRCode.toDataURL(cardapioUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#E10600',
          light: '#FFFFFF',
        },
      })
      setQrCodeUrl(qr)
    } catch (err) {
      console.error('Error generating QR code:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-red-strong min-h-screen flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-red-strong min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-black-dark text-lg mb-4">Loja não encontrada</p>
          <p className="text-gray-600">Entre em contato com o suporte.</p>
        </div>
      </div>
    )
  }

  const cardapioUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/loja/${store.slug}`

  return (
    <div className="bg-red-strong min-h-screen">
      {/* Header */}
      <header className="bg-red-strong border-b-2 border-red-dark text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-frango-dourado.png" 
              alt="Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <h1 className="text-2xl font-bold"></h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/loja/${store.slug}`}
              target="_blank"
              className="bg-yellow-gold text-black-dark px-4 py-2 rounded-lg hover:bg-opacity-90 transition font-semibold text-sm"
            >
              Ver Cardápio
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-red-dark px-4 py-2 rounded-lg hover:bg-opacity-90 transition text-sm font-semibold"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-7xl overflow-x-hidden">
        {/* Mensagens */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Grid Layout - Organizado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* QR Code Section - Lado Esquerdo */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 border-2 border-red-dark">
            <h2 className="text-2xl font-bold text-black-dark mb-4">QR Code do Cardápio</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white p-4 rounded-lg border-2 border-red-dark flex-shrink-0">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56" />
                ) : (
                  <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-200 flex items-center justify-center rounded">
                    <p className="text-gray-500 text-sm">Gerando QR Code...</p>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black-dark mb-2">Link do Cardápio</h3>
                <div className="bg-gray-50 p-3 rounded border-2 border-red-dark mb-3">
                  <code className="text-xs break-all text-black-dark">{cardapioUrl}</code>
                </div>
                <p className="text-sm text-black-dark mb-4">
                  Escaneie o QR Code ou compartilhe o link acima.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cardapioUrl)
                      setMessage('Link copiado!')
                      setTimeout(() => setMessage(''), 3000)
                    }}
                    className="bg-red-strong text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-dark transition text-sm"
                  >
                    Copiar Link
                  </button>
                  {qrCodeUrl && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = qrCodeUrl
                        link.download = `qr-code-${store.slug}.png`
                        link.click()
                      }}
                      className="bg-yellow-gold text-black-dark px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition text-sm"
                    >
                      Baixar QR Code
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Redes Sociais e App - Lado Direito */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-dark">
            <h2 className="text-xl font-bold text-black-dark mb-4">Redes Sociais</h2>
          <form onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const data = {
              id: store.id,
              name: store.name,
              slug: store.slug,
              description: store.description,
              facebookUrl: formData.get('facebookUrl') || undefined,
              instagramUrl: formData.get('instagramUrl') || undefined,
              whatsappUrl: formData.get('whatsappUrl') || undefined,
              appUrl: formData.get('appUrl') || undefined,
            }
            try {
              const res = await fetch('/api/stores', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
              if (res.ok) {
                setMessage('Redes sociais atualizadas!')
                fetchStore()
                setTimeout(() => setMessage(''), 3000)
              }
            } catch (err) {
              setError('Erro ao atualizar redes sociais')
            }
          }} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-black-dark mb-1">Facebook</label>
                <input
                  type="url"
                  name="facebookUrl"
                  defaultValue={store.facebookUrl || ''}
                  className="w-full px-3 py-2 text-sm border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-black-dark mb-1">Instagram</label>
                <input
                  type="url"
                  name="instagramUrl"
                  defaultValue={store.instagramUrl || ''}
                  className="w-full px-3 py-2 text-sm border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-black-dark mb-1">WhatsApp</label>
                <input
                  type="url"
                  name="whatsappUrl"
                  defaultValue={store.whatsappUrl || ''}
                  className="w-full px-3 py-2 text-sm border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-black-dark mb-1">App Oficial</label>
                <input
                  type="url"
                  name="appUrl"
                  defaultValue={store.appUrl || ''}
                  className="w-full px-3 py-2 text-sm border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
                  placeholder="https://play.google.com/..."
                />
              </div>
              <button
                type="submit"
                className="bg-red-strong text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-dark transition w-full text-sm"
              >
                Salvar
              </button>
            </form>
          </div>
        </div>

        {/* Tabs e Conteúdo Principal */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-red-dark overflow-hidden max-w-full">
          {/* Tabs */}
          <div className="bg-gray-50 border-b-2 border-red-dark p-4">
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-2 rounded-lg transition font-semibold text-sm ${
                  activeTab === 'categories'
                    ? 'bg-red-strong text-white'
                    : 'bg-white text-black-dark hover:bg-red-dark hover:text-white border-2 border-red-dark'
                }`}
              >
                Categorias
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-2 rounded-lg transition font-semibold text-sm ${
                  activeTab === 'products'
                    ? 'bg-red-strong text-white'
                    : 'bg-white text-black-dark hover:bg-red-dark hover:text-white border-2 border-red-dark'
                }`}
              >
                Produtos
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-2 rounded-lg transition font-semibold text-sm ${
                  activeTab === 'reviews'
                    ? 'bg-red-strong text-white'
                    : 'bg-white text-black-dark hover:bg-red-dark hover:text-white border-2 border-red-dark'
                }`}
              >
                Avaliações
              </button>
            </nav>
          </div>

          {/* Conteúdo */}
          <div className="p-6 overflow-x-hidden">
            {activeTab === 'categories' && (
              <CategoriesSection storeId={store.id} onUpdate={fetchStore} />
            )}

            {activeTab === 'products' && (
              <ProductsSection storeId={store.id} categories={store.categories || []} onUpdate={fetchStore} />
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection storeId={store.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Categorias
function CategoriesSection({ storeId, onUpdate }: { storeId: number; onUpdate: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      id: editingCategory?.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      orderPosition: parseInt(formData.get('order_position') as string) || 0,
    }

    try {
      const url = '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro ao salvar categoria')
      } else {
        setMessage(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!')
        setShowForm(false)
        setEditingCategory(null)
        fetchCategories()
        onUpdate()
      }
    } catch (err) {
      setError('Erro ao salvar categoria')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza? Isso também removerá todos os produtos desta categoria.')) {
      return
    }

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Categoria removida!')
        fetchCategories()
        onUpdate()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao remover categoria')
      }
    } catch (err) {
      setError('Erro ao remover categoria')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-black-dark">Categorias</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingCategory(null)
          }}
          className="bg-red-strong text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-dark transition"
        >
          + Nova Categoria
        </button>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-red-dark mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={editingCategory?.id} />
            <div>
              <label className="block text-black-dark font-semibold mb-2">Nome</label>
              <input
                type="text"
                name="name"
                defaultValue={editingCategory?.name || ''}
                required
                className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
              />
            </div>
            <div>
              <label className="block text-black-dark font-semibold mb-2">Descrição</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingCategory?.description || ''}
                className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
              />
            </div>
            <div>
              <label className="block text-black-dark font-semibold mb-2">Ordem</label>
              <input
                type="number"
                name="order_position"
                defaultValue={editingCategory?.orderPosition || 0}
                className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-red-strong text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-dark transition"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                }}
                className="bg-gray-300 text-black-dark px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-50 p-4 rounded-lg border-2 border-red-dark flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-black-dark">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
              <p className="text-xs text-gray-500">Ordem: {category.orderPosition}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCategory(category)
                  setShowForm(true)
                }}
                className="bg-yellow-gold text-black-dark px-3 py-1 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="bg-red-strong text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-dark transition"
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-gray-600 text-center py-8">Nenhuma categoria criada ainda.</p>
        )}
      </div>
    </div>
  )
}

// Componente de Produtos
function ProductsSection({
  storeId,
  categories,
  onUpdate,
}: {
  storeId: number
  categories: Category[]
  onUpdate: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
        setFilteredProducts(data)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  // Filtrar produtos baseado na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query)
      const descMatch = product.description?.toLowerCase().includes(query) || false
      return nameMatch || descMatch
    })
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      id: editingProduct?.id,
      categoryId: parseInt(formData.get('category_id') as string),
      storeId: storeId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image: (formData.get('image') as string) || undefined,
      isAvailable: formData.get('is_available') === 'on',
      isHot: formData.get('is_hot') === 'on',
    }

    try {
      const url = '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro ao salvar produto')
      } else {
        setMessage(editingProduct ? 'Produto atualizado!' : 'Produto criado!')
        setShowForm(false)
        setEditingProduct(null)
        fetchProducts()
        onUpdate()
      }
    } catch (err) {
      setError('Erro ao salvar produto')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
      return
    }

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Produto removido!')
        fetchProducts()
        onUpdate()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao remover produto')
      }
    } catch (err) {
      setError('Erro ao remover produto')
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch('/api/products/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchProducts()
        onUpdate()
      }
    } catch (err) {
      setError('Erro ao alterar status do produto')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-black-dark">Produtos</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingProduct(null)
          }}
          className="bg-red-strong text-white px-4 py-2 rounded font-semibold hover:bg-red-dark transition"
        >
          + Novo Produto
        </button>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Campo de Busca */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar produtos por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong text-black-dark"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black-dark opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black-dark opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-black-dark opacity-70 mt-2">
            {filteredProducts.length} produto(s) encontrado(s)
          </p>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded border border-red-dark mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={editingProduct?.id} />
            <div>
              <label className="block text-black-dark font-semibold mb-2">Categoria</label>
              <select
                name="category_id"
                defaultValue={editingProduct?.categoryId || ''}
                required
                className="w-full px-4 py-2 border border-red-dark rounded"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black-dark font-semibold mb-2">Nome</label>
              <input
                type="text"
                name="name"
                defaultValue={editingProduct?.name || ''}
                required
                className="w-full px-4 py-2 border border-red-dark rounded"
              />
            </div>
            <div>
              <label className="block text-black-dark font-semibold mb-2">Descrição</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingProduct?.description || ''}
                className="w-full px-4 py-2 border border-red-dark rounded"
              />
            </div>
            <div>
              <label className="block text-black-dark font-semibold mb-2">Preço (MT)</label>
              <input
                type="number"
                name="price"
                step="1"
                min="0"
                defaultValue={editingProduct?.price || ''}
                required
                className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
              />
            </div>
            <div>
              <label className="block text-black-dark font-semibold mb-2">Imagem</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Opção 1: Upload de arquivo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          })
                          if (res.ok) {
                            const data = await res.json()
                            const urlInput = document.querySelector('input[name="image"]') as HTMLInputElement
                            if (urlInput) {
                              urlInput.value = data.url
                            }
                            setMessage('Imagem enviada com sucesso!')
                            setTimeout(() => setMessage(''), 3000)
                          } else {
                            const error = await res.json()
                            setError(error.error || 'Erro ao fazer upload')
                          }
                        } catch (err) {
                          setError('Erro ao fazer upload da imagem')
                        }
                      }
                    }}
                    className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong text-sm"
                  />
                </div>
                <div className="text-center text-gray-500 text-xs">ou</div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Opção 2: URL da imagem</label>
                  <input
                    type="url"
                    name="image"
                    defaultValue={editingProduct?.image || ''}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_available"
                  defaultChecked={editingProduct?.isAvailable !== false}
                  className="w-4 h-4"
                />
                <span className="text-black-dark font-semibold">Disponível</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_hot"
                  defaultChecked={editingProduct?.isHot === true}
                  className="w-4 h-4"
                />
                <span className="text-black-dark font-semibold">🔥 Hot/Recomendado</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-red-strong text-white px-4 py-2 rounded font-semibold hover:bg-red-dark"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                }}
                className="bg-gray-300 text-black-dark px-4 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg border-2 border-red-dark hover:shadow-md transition-shadow w-full">
            <div className="flex gap-4 items-start w-full">
              {/* Imagem do Produto */}
              {product.image && (
                <div className="flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-24 h-24 object-cover rounded border border-gray-200" 
                  />
                </div>
              )}
              
              {/* Informações do Produto */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-bold text-lg text-black-dark break-words flex-1 min-w-0">{product.name}</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-2 break-words">{product.description}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-base font-bold text-red-strong">
                    Preço: MT {product.price.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Categoria: {product.category?.name}
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(product.id)}
                  className="bg-yellow-gold text-black-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition whitespace-nowrap"
                >
                  {product.isAvailable ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(product)
                    setShowForm(true)
                  }}
                  className="bg-yellow-gold text-black-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition whitespace-nowrap"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-strong text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-dark transition whitespace-nowrap"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && searchQuery && (
          <p className="text-gray-600 text-center py-8">Nenhum produto encontrado com "{searchQuery}".</p>
        )}
        {filteredProducts.length === 0 && !searchQuery && (
          <p className="text-gray-600 text-center py-8">Nenhum produto criado ainda.</p>
        )}
      </div>
    </div>
  )
}

interface Review {
  id: number
  productId: number
  userName: string
  rating: number
  comment: string
  createdAt: Date
  product?: {
    id: number
    name: string
  }
}

function ReviewsSection({ storeId }: { storeId: number }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Erro ao carregar avaliações')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) {
      return
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Avaliação excluída com sucesso!')
        setError('')
        fetchReviews()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir avaliação')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      setError('Erro ao excluir avaliação')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-black-dark">Carregando avaliações...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black-dark mb-2">Avaliações e Comentários</h2>
        <p className="text-sm text-black-dark opacity-70">
          Gerencie todas as avaliações dos seus produtos. Você pode excluir avaliações inadequadas.
        </p>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-gray-200">
          <p className="text-black-dark text-lg mb-2">Nenhuma avaliação ainda</p>
          <p className="text-black-dark opacity-70 text-sm">
            Quando os clientes avaliarem seus produtos, elas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border-2 border-red-dark rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-black-dark text-lg">{review.userName}</h3>
                    <div className="flex items-center">
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-sm text-black-dark opacity-70">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  {review.product && (
                    <p className="text-sm text-red-strong font-semibold mb-2">
                      Produto: {review.product.name}
                    </p>
                  )}
                  
                  <p className="text-black-dark">{review.comment}</p>
                </div>
                
                <button
                  onClick={() => handleDelete(review.id)}
                  className="bg-red-strong text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-dark transition whitespace-nowrap flex-shrink-0"
                  title="Excluir avaliação"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
