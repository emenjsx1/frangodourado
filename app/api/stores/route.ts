import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, getCategoriesByStoreId, getProductsByStoreId, getCategoryById } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const categories = await getCategoriesByStoreId(store.id)
          const products = await getProductsByStoreId(store.id)
          const productsWithCategory = await Promise.all(
            products.map(async (p) => {
              const category = await getCategoryById(p.categoryId)
              return {
                ...p,
                category,
              }
            })
          )
          return NextResponse.json({
            ...store,
            categories,
            products: productsWithCategory,
          })
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    await initializeMockData()
    const store = mockData.stores.findByUserId(parseInt(session.user.id))
    
    if (!store) {
      return NextResponse.json(null)
    }

    const storeCategories = mockData.categories.findByStoreId(store.id)
    const storeProducts = mockData.products.findByStoreId(store.id).map(p => ({
      ...p,
      category: mockData.categories.findById(p.categoryId),
    }))

    return NextResponse.json({
      ...store,
      categories: storeCategories,
      products: storeProducts,
    })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar loja' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeMockData()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, slug, description } = await request.json()

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const existingStore = mockData.stores.findBySlug(slug)

    if (existingStore) {
      return NextResponse.json(
        { error: 'Slug já existe' },
        { status: 400 }
      )
    }

    const store = mockData.stores.create({
      userId: parseInt(session.user.id),
      name,
      slug,
      description: description || undefined,
    })

    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { error: 'Erro ao criar loja' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeMockData()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id, name, slug, description } = await request.json()

    // Verificar se a loja pertence ao usuário
    const store = mockData.stores.findByUserId(parseInt(session.user.id))

    if (!store || store.id !== id) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se slug já existe (exceto a própria loja)
    if (slug !== store.slug) {
      const existingStore = mockData.stores.findBySlug(slug)

      if (existingStore) {
        return NextResponse.json(
          { error: 'Slug já existe' },
          { status: 400 }
        )
      }
    }

    const { facebookUrl, instagramUrl, whatsappUrl, appUrl, address, phone, email } = await request.json()

    const updatedStore = mockData.stores.update(id, {
      name,
      slug,
      description: description || undefined,
      facebookUrl: facebookUrl || undefined,
      instagramUrl: instagramUrl || undefined,
      whatsappUrl: whatsappUrl || undefined,
      appUrl: appUrl || undefined,
      address: address || undefined,
      phone: phone || undefined,
      email: email || undefined,
    })

    if (!updatedStore) {
      return NextResponse.json(
        { error: 'Erro ao atualizar loja' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar loja' },
      { status: 500 }
    )
  }
}
