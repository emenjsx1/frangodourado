'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import StarRating from '@/components/StarRating'
import DripSeparator from '@/components/DripSeparator'

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
}

interface Review {
  id: number
  productId: number
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

// Helper function para formatar datas de forma consistente
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function LojaPage() {
  const params = useParams()
  const slug = params.slug as string
  const [store, setStore] = useState<Store | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState({ userName: '', rating: 0, comment: '' })

  // Forçar zoom fixo de 85% em mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=0.85, maximum-scale=0.85, minimum-scale=0.85, user-scalable=no')
      }
    }
  }, [])

  useEffect(() => {
    fetchStore()
  }, [slug])

  useEffect(() => {
    if (store && store.categories.length > 0) {
      const firstCategory = store.categories[0]
      setSelectedCategory(firstCategory.id)
      handleCategoryChange(firstCategory.id)
    }
  }, [store])

  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct.id)
    }
  }, [selectedProduct])

  // Filtrar produtos baseado na busca e disponibilidade
  useEffect(() => {
    const available = allProducts.filter((p) => p.isAvailable)
    
    if (!searchQuery.trim()) {
      setFilteredProducts(available)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = available.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query)
      const descMatch = product.description?.toLowerCase().includes(query) || false
      return nameMatch || descMatch
    })
    setFilteredProducts(filtered)
  }, [searchQuery, allProducts])

  const fetchStore = async () => {
    try {
      const res = await fetch(`/api/stores/${slug}`)
      const data = await res.json()
      
      if (res.ok && !data.error) {
        setStore(data)
      } else {
        setStore(null)
      }
    } catch (err) {
      console.error('Error fetching store:', err)
      setStore(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (categoryId: number) => {
    setSelectedCategory(categoryId)
    
    try {
      // Se for categoria "Recomendados", buscar produtos hot
      const categoria = store?.categories.find(c => c.id === categoryId)
      const isRecomendados = categoria?.name === 'Recomendados'
      
      if (isRecomendados) {
        // Buscar todos os produtos e filtrar apenas os hot
        const res = await fetch(`/api/stores/${slug}/products`)
        if (res.ok) {
          const data = await res.json()
          const hotProducts = data.filter((p: Product) => p.isHot === true && p.isAvailable === true)
          setAllProducts(hotProducts)
          setFilteredProducts(hotProducts)
        }
      } else {
        const res = await fetch(`/api/stores/${slug}/products?categoria=${categoryId}`)
        if (res.ok) {
          const data = await res.json()
          setAllProducts(data)
          setFilteredProducts(data)
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const fetchReviews = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
        setReviewCount(data.reviewCount || 0)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    }
  }


  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !newReview.userName || !newReview.comment || newReview.rating === 0) {
      return
    }

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      })

      if (res.ok) {
        setNewReview({ userName: '', rating: 0, comment: '' })
        fetchReviews(selectedProduct.id)
      }
    } catch (err) {
      console.error('Error submitting review:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-strong">
        <p className="text-white">Carregando...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-strong">
        <p className="text-white">Loja não encontrada</p>
      </div>
    )
  }

  const availableProducts = filteredProducts
  const currentCategory = store.categories.find(c => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-red-strong">
      {/* Header com Logo e Cores do Design */}
      <header className="bg-red-strong border-b-2 border-red-dark py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img 
            src="/logo-frango-dourado.png" 
            alt={store.name}
            className="h-20 w-auto mx-auto mb-4 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <h1 className="text-4xl font-bold text-white mb-2">{}</h1>
          <p className="text-2xl font-semibold text-yellow-gold">NOSSO MAGNIFICO CARDÁPIO</p>
        </div>
      </header>

      {/* Separador antes das Categorias */}
      <DripSeparator topColor="bg-red-strong" bottomColor="bg-white" height="h-10" />

      {/* Categorias - Menu Horizontal com Cores do Design */}
      {store.categories.length > 0 && (
        <div className="bg-white sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 relative">
            {/* Seta esquerda */}
            <button
              onClick={() => {
                const container = document.getElementById('categories-scroll')
                if (container) container.scrollBy({ left: -200, behavior: 'smooth' })
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-red-strong text-red-strong hover:text-white p-2 rounded-full shadow-lg transition-colors"
              aria-label="Scroll esquerda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Seta direita */}
            <button
              onClick={() => {
                const container = document.getElementById('categories-scroll')
                if (container) container.scrollBy({ left: 200, behavior: 'smooth' })
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-red-strong text-red-strong hover:text-white p-2 rounded-full shadow-lg transition-colors"
              aria-label="Scroll direita"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div id="categories-scroll" className="flex gap-2 overflow-x-auto scrollbar-hide px-8">
              {store.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-red-strong text-white'
                      : 'bg-white text-black-dark hover:bg-red-dark hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal - Lista Simples */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentCategory && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{currentCategory.name}</h2>
            {currentCategory.description && (
              <p className="text-white opacity-90">{currentCategory.description}</p>
            )}
          </div>
        )}

        {/* Campo de Busca */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-gold bg-white text-black-dark text-lg"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black-dark opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black-dark opacity-50 hover:opacity-100 text-xl"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-white opacity-80 mt-2 text-sm">
              {availableProducts.length} produto(s) encontrado(s)
            </p>
          )}
        </div>

        {/* Lista de Produtos - Estilo Simples */}
        {availableProducts.length > 0 ? (
          <div className="space-y-6">
            {availableProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white border-b-2 border-red-dark pb-6 cursor-pointer hover:shadow-lg p-4 rounded-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Imagem do Produto */}
                  {product.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  {/* Informações */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-black-dark mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-black-dark mb-2 text-sm">{product.description}</p>
                    )}
                    <p className="text-lg font-bold text-red-strong">
                      Preço: MT {product.price.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white">Nenhum produto disponível nesta categoria.</p>
          </div>
        )}
      </main>

      {/* Modal de Detalhes e Avaliações */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b-2 border-red-dark bg-red-strong">
              <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Imagem do Produto */}
            {selectedProduct.image && (
              <div className="w-full h-64 bg-gray-100">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Conteúdo */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-2xl font-bold text-yellow-gold mb-2">
                  MT {selectedProduct.price.toFixed(0)}
                </p>
                {selectedProduct.description && (
                  <p className="text-black-dark">{selectedProduct.description}</p>
                )}
              </div>

              {/* Avaliações */}
              <div className="border-t-2 border-red-dark pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={averageRating} size="md" />
                  <span className="text-black-dark text-sm">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'Sem avaliações'} ({reviewCount})
                  </span>
                </div>

                {/* Formulário de Avaliação */}
                <div className="bg-red-strong bg-opacity-10 rounded-lg p-4 mb-6 border border-red-dark">
                  <h4 className="font-semibold text-black-dark mb-3">Deixe sua avaliação</h4>
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={newReview.userName}
                      onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-red-dark rounded focus:outline-none focus:ring-2 focus:ring-red-strong"
                      required
                    />
                    <div>
                      <label className="block text-sm text-black-dark mb-1 font-semibold">Avaliação</label>
                      <StarRating
                        rating={newReview.rating}
                        interactive={true}
                        onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                      />
                    </div>
                    <textarea
                      placeholder="Seu comentário..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-red-dark rounded focus:outline-none focus:ring-2 focus:ring-red-strong"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-red-strong text-white py-2 rounded font-semibold hover:bg-red-dark transition-colors"
                    >
                      Enviar Avaliação
                    </button>
                  </form>
                </div>

                {/* Lista de Avaliações */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-black-dark">Avaliações ({reviewCount})</h4>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-red-dark pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-black-dark">{review.userName}</p>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <span className="text-xs text-black-dark opacity-70">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-black-dark mt-2 text-sm">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-black-dark text-center py-4 text-sm">
                      Ainda não há avaliações. Seja o primeiro!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Separador antes do Footer - Transição do conteúdo para o footer */}
      <DripSeparator topColor="bg-white" bottomColor="bg-red-strong" height="h-12" />

      {/* Footer com Logo, Localização e Redes */}
      <footer className="bg-red-strong text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Linha Superior: Logo à esquerda, Redes Sociais e App à direita */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
            {/* Logo e Nome */}
            <div className="text-center md:text-left">
              <img 
                src="/logo-frango-dourado.png" 
                alt={store.name}
                className="h-12 md:h-14 w-auto mx-auto md:mx-0 mb-2 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <h3 className="text-lg md:text-xl font-bold">{}</h3>
            </div>

            {/* Redes Sociais e App - Menores */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex gap-2">
                {store.facebookUrl && (
                  <a
                    href={store.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-blue-600 p-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {store.instagramUrl && (
                  <a
                    href={store.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-pink-600 p-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {store.whatsappUrl && (
                  <a
                    href={store.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-green-600 p-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center"
                    aria-label="WhatsApp"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                )}
              </div>
              {store.appUrl && (
                <a
                  href={store.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-yellow-gold text-black-dark px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-opacity-90 transition-colors"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-2.24-1.01-3.89-1.75-4.99-3.01-1.09-1.25-1.15-2.36-.62-3.72.54-1.36 1.51-2.25 2.76-2.7.63-.23 1.25-.35 1.87-.35.66 0 1.31.14 1.94.48.26.14.51.31.75.5.24.19.46.4.66.65.2.25.37.52.52.8.15.28.28.58.39.89.11.31.19.64.25.98.06.34.09.69.09 1.04 0 .35-.03.7-.09 1.04-.06.34-.14.67-.25.98-.11.31-.24.61-.39.89-.15.28-.32.55-.52.8-.2.25-.42.46-.66.65-.24.19-.49.36-.75.5-.63.34-1.28.48-1.94.48-.62 0-1.24-.12-1.87-.35-1.25-.45-2.22-1.34-2.76-2.7-.53-1.36-.47-2.47.62-3.72 1.1-1.26 2.75-2 4.99-3.01 1.16-.48 2.15-.94 3.24-1.44 1.03-.48 2.1-.55 3.08.4.98.95 1.86 2.02 2.66 3.2.8 1.18 1.48 2.36 2.06 3.54.58 1.18 1.06 2.36 1.44 3.54.38 1.18.66 2.36.84 3.54.18 1.18.26 2.36.26 3.54 0 1.18-.08 2.36-.26 3.54-.18 1.18-.46 2.36-.84 3.54-.38 1.18-.86 2.36-1.44 3.54-.58 1.18-1.26 2.36-2.06 3.54-.8 1.18-1.68 2.25-2.66 3.2z"/>
                  </svg>
                  <span>Baixar App</span>
                </a>
              )}
            </div>
          </div>

         
          {/* Linha Inferior: Copyright (última coisa) */}
          <div className="text-center pt-4 border-t border-red-dark">
            <p className="text-xs opacity-80">Cardápio Digital © 2025</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
