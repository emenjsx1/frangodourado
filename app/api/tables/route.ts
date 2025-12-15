import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, getTablesByStoreId, createTable } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const tables = await getTablesByStoreId(store.id, activeOnly)
          return NextResponse.json(tables)
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data (vazio por enquanto)
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mesas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { number, isActive } = await request.json()

    if (!number || number < 1) {
      return NextResponse.json(
        { error: 'Número da mesa é obrigatório e deve ser maior que 0' },
        { status: 400 }
      )
    }

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          // Verificar se já existe mesa com esse número
          const existingTables = await getTablesByStoreId(store.id, false)
          if (existingTables.some(t => t.number === number)) {
            return NextResponse.json(
              { error: 'Já existe uma mesa com esse número' },
              { status: 400 }
            )
          }

          const table = await createTable({
            storeId: store.id,
            number,
            isActive: isActive !== false,
          })

          if (table) {
            return NextResponse.json(table)
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase error:', supabaseError)
        return NextResponse.json(
          { error: 'Erro ao criar mesa' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro ao criar mesa' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Erro ao criar mesa' },
      { status: 500 }
    )
  }
}



