import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getStoreByUserId,
  getStoreBySlug,
  getOrdersByStoreId,
  getOrdersByPhone,
  createOrder,
  getProductById,
  createOrderItem,
  getNextOrderNumber,
} from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const phone = searchParams.get('phone')
    const storeSlug = searchParams.get('store_slug')

    // Se buscar por telefone (público)
    if (phone) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        try {
          const orders = await getOrdersByPhone(phone)
          return NextResponse.json(orders)
        } catch (supabaseError) {
          console.warn('Supabase error:', supabaseError)
        }
      }
      return NextResponse.json([])
    }

    // Se buscar por loja (admin)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        let store
        if (storeSlug) {
          store = await getStoreBySlug(storeSlug)
        } else {
          store = await getStoreByUserId(parseInt(session.user.id))
        }

        if (store) {
          const orders = await getOrdersByStoreId(store.id, status || undefined)
          return NextResponse.json(orders)
        }
      } catch (supabaseError) {
        console.warn('Supabase error:', supabaseError)
      }
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      storeSlug,
      tableId,
      customerName,
      customerPhone,
      paymentMethod,
      items,
      receiptId,
    } = body

    // tableId pode ser 0 para retirada no caixa
    if (!storeSlug || (tableId !== 0 && !tableId) || !customerName || !customerPhone || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Validar método de pagamento
    if (!['cash', 'mpesa', 'emola', 'pos'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Buscar loja
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    const store = await getStoreBySlug(storeSlug)
    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Validar produtos e calcular total e tempo estimado
    let totalAmount = 0
    let estimatedTime = 0

    for (const item of items) {
      const product = await getProductById(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.productId} não encontrado` },
          { status: 404 }
        )
      }
      if (!product.isAvailable) {
        return NextResponse.json(
          { error: `Produto ${product.name} não está disponível` },
          { status: 400 }
        )
      }

      totalAmount += product.price * item.quantity
      estimatedTime += (product.preparationTime || 5) * item.quantity
    }

    // Criar ou atualizar customer automaticamente
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Verificar se customer já existe
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerPhone)
          .single()

        if (!existingCustomer) {
          // Criar novo customer
          await supabase
            .from('customers')
            .insert({
              name: customerName,
              phone: customerPhone,
            })
        } else {
          // Atualizar customer existente
          await supabase
            .from('customers')
            .update({
              name: customerName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingCustomer.id)
        }
      } catch (customerError) {
        console.warn('Error creating/updating customer:', customerError)
        // Continuar mesmo se falhar a criação do customer
      }
    }

    // Criar pedido
    // Se tableId for 0, significa retirada no caixa (usar NULL)
    const finalTableId = tableId === 0 ? null : tableId
    
    const order = await createOrder({
      storeId: store.id,
      tableId: finalTableId,
      customerName,
      customerPhone,
      paymentMethod,
      status: paymentMethod === 'pos' || paymentMethod === 'cash' ? 'paid' : 'pending_approval',
      totalAmount,
      estimatedTime,
      receiptId,
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Criar itens do pedido
    for (const item of items) {
      const product = await getProductById(item.productId)
      if (product) {
        await createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          notes: item.notes || undefined,
        })
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}

