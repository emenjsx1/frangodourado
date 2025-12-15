import { NextRequest, NextResponse } from 'next/server'
import { getOrdersByPhone } from '@/lib/db-supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Número de telefone é obrigatório' },
        { status: 400 }
      )
    }

    const orders = await getOrdersByPhone(phone)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders by phone:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}



