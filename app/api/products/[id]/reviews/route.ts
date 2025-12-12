import { NextRequest, NextResponse } from 'next/server'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMockData()
    const { id } = await params
    const productId = parseInt(id)

    const productReviews = mockData.reviews.findByProductId(productId)
    const averageRating = mockData.reviews.getAverageRating(productId)
    const reviewCount = mockData.reviews.getCount(productId)

    return NextResponse.json({
      reviews: productReviews,
      averageRating,
      reviewCount,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMockData()
    const { id } = await params
    const productId = parseInt(id)

    const { userName, rating, comment } = await request.json()

    if (!userName || !rating || !comment) {
      return NextResponse.json(
        { error: 'Preencha todos os campos' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5 estrelas' },
        { status: 400 }
      )
    }

    const review = mockData.reviews.create({
      productId,
      userName,
      rating: parseInt(rating),
      comment,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    )
  }
}

