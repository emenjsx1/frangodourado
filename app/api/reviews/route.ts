import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mockData, initializeMockData } from '@/lib/mock-data'

// GET - Buscar todas as avaliações da loja do admin
export async function GET(request: NextRequest) {
  try {
    await initializeMockData()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const store = mockData.stores.findByUserId(parseInt(session.user.id))

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Buscar todos os produtos da loja
    const products = mockData.products.findByStoreId(store.id)
    
    // Buscar todas as avaliações dos produtos da loja
    const allReviews = []
    for (const product of products) {
      const productReviews = mockData.reviews.findByProductId(product.id)
      for (const review of productReviews) {
        allReviews.push({
          ...review,
          product: {
            id: product.id,
            name: product.name,
          }
        })
      }
    }

    // Ordenar por data mais recente
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(allReviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    )
  }
}

