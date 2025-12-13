import { supabaseAdmin } from './supabase'

// Verificar se Supabase está configurado
if (!supabaseAdmin) {
  console.warn('⚠️ Supabase não está configurado. Certifique-se de criar o arquivo .env.local com as credenciais.')
}

// Interfaces
export interface User {
  id: number
  name: string
  email: string
  password: string
}

export interface Store {
  id: number
  userId: number
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
  mpesaName?: string
  mpesaPhone?: string
  emolaName?: string
  emolaPhone?: string
}

export interface Category {
  id: number
  storeId: number
  name: string
  description?: string
  orderPosition: number
}

export interface Product {
  id: number
  categoryId: number
  storeId: number
  name: string
  description?: string
  price: number
  image?: string
  isAvailable: boolean
  isHot?: boolean
  preparationTime?: number
}

export interface Table {
  id: number
  storeId: number
  number: number
  isActive: boolean
}

export interface Order {
  id: number
  storeId: number
  orderNumber: string
  tableId: number | null // null para retirada no caixa
  customerName: string
  customerPhone: string
  paymentMethod: 'cash' | 'mpesa' | 'emola' | 'pos'
  status: 'pending_approval' | 'approved' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  totalAmount: number
  estimatedTime: number
  receiptId?: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  notes?: string
}

export interface PaymentReceipt {
  id: number
  orderId: number
  paymentMethod: 'mpesa' | 'emola' | 'pos'
  receiptUrl: string
  isApproved: boolean
  approvedBy?: number
  approvedAt?: Date
  createdAt: Date
}

// Funções para buscar dados do Supabase
export async function getStoreBySlug(slug: string) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    slug: data.slug,
    description: data.description || undefined,
    address: data.address || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    facebookUrl: data.facebook_url || undefined,
    instagramUrl: data.instagram_url || undefined,
    whatsappUrl: data.whatsapp_url || undefined,
    appUrl: data.app_url || undefined,
    mpesaName: data.mpesa_name || undefined,
    mpesaPhone: data.mpesa_phone || undefined,
    emolaName: data.emola_name || undefined,
    emolaPhone: data.emola_phone || undefined,
  } as Store
}

export async function getCategoriesByStoreId(storeId: number) {
  if (!supabaseAdmin) return []
  
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('order_position', { ascending: true })

  if (error || !data) return []
  return data.map(cat => ({
    id: cat.id,
    storeId: cat.store_id,
    name: cat.name,
    description: cat.description || undefined,
    orderPosition: cat.order_position,
  })) as Category[]
}

export async function getProductsByStoreId(storeId: number, categoryId?: number) {
  if (!supabaseAdmin) return []
  
  let query = supabaseAdmin
    .from('products')
    .select('*')
    .eq('store_id', storeId)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data.map(prod => ({
    id: prod.id,
    categoryId: prod.category_id,
    storeId: prod.store_id,
    name: prod.name,
    description: prod.description || undefined,
    price: parseFloat(prod.price),
    image: prod.image || undefined,
    isAvailable: prod.is_available,
    isHot: prod.is_hot || false,
  })) as Product[]
}

export async function getStoreByUserId(userId: number) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    slug: data.slug,
    description: data.description || undefined,
    address: data.address || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    facebookUrl: data.facebook_url || undefined,
    instagramUrl: data.instagram_url || undefined,
    whatsappUrl: data.whatsapp_url || undefined,
    appUrl: data.app_url || undefined,
    mpesaName: data.mpesa_name || undefined,
    mpesaPhone: data.mpesa_phone || undefined,
    emolaName: data.emola_name || undefined,
    emolaPhone: data.emola_phone || undefined,
  } as Store
}

// Função para atualizar loja
export async function updateStore(id: number, store: Partial<Store>) {
  if (!supabaseAdmin) {
    console.error('Supabase não está configurado')
    return null
  }
  
  const updateData: any = {}
  if (store.name !== undefined) updateData.name = store.name
  if (store.slug !== undefined) updateData.slug = store.slug
  if (store.description !== undefined) updateData.description = store.description || null
  if (store.address !== undefined) updateData.address = store.address || null
  if (store.phone !== undefined) updateData.phone = store.phone || null
  if (store.email !== undefined) updateData.email = store.email || null
  if (store.facebookUrl !== undefined) updateData.facebook_url = store.facebookUrl || null
  if (store.instagramUrl !== undefined) updateData.instagram_url = store.instagramUrl || null
  if (store.whatsappUrl !== undefined) updateData.whatsapp_url = store.whatsappUrl || null
  if (store.appUrl !== undefined) updateData.app_url = store.appUrl || null
  if (store.mpesaName !== undefined) updateData.mpesa_name = store.mpesaName || null
  if (store.mpesaPhone !== undefined) updateData.mpesa_phone = store.mpesaPhone || null
  if (store.emolaName !== undefined) updateData.emola_name = store.emolaName || null
  if (store.emolaPhone !== undefined) updateData.emola_phone = store.emolaPhone || null
  
  console.log('Atualizando loja no Supabase:', { id, updateData })
  
  const { data, error } = await supabaseAdmin
    .from('stores')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar loja no Supabase:', error)
    throw error
  }
  
  if (!data) {
    console.error('Nenhum dado retornado ao atualizar loja')
    return null
  }
  
  console.log('Loja atualizada com sucesso:', data)
  
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    slug: data.slug,
    description: data.description || undefined,
    address: data.address || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    facebookUrl: data.facebook_url || undefined,
    instagramUrl: data.instagram_url || undefined,
    whatsappUrl: data.whatsapp_url || undefined,
    appUrl: data.app_url || undefined,
    mpesaName: data.mpesa_name || undefined,
    mpesaPhone: data.mpesa_phone || undefined,
    emolaName: data.emola_name || undefined,
    emolaPhone: data.emola_phone || undefined,
  } as Store
}

export async function getCategoryById(categoryId: number) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    storeId: data.store_id,
    name: data.name,
    description: data.description || undefined,
    orderPosition: data.order_position,
  } as Category
}

// Funções para escrever dados no Supabase
export async function createProduct(product: Omit<Product, 'id'>) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      category_id: product.categoryId,
      store_id: product.storeId,
      name: product.name,
      description: product.description || null,
      price: product.price,
      image: product.image || null,
      is_available: product.isAvailable,
      is_hot: product.isHot || false,
      preparation_time: product.preparationTime || 5,
    })
    .select()
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    categoryId: data.category_id,
    storeId: data.store_id,
    name: data.name,
    description: data.description || undefined,
    price: parseFloat(data.price),
    image: data.image || undefined,
    isAvailable: data.is_available,
    isHot: data.is_hot || false,
  } as Product
}

export async function updateProduct(id: number, product: Partial<Product>) {
  if (!supabaseAdmin) return null
  
  const updateData: any = {}
  if (product.categoryId !== undefined) updateData.category_id = product.categoryId
  if (product.name !== undefined) updateData.name = product.name
  if (product.description !== undefined) updateData.description = product.description || null
  if (product.price !== undefined) updateData.price = product.price
  if (product.image !== undefined) updateData.image = product.image || null
  if (product.isAvailable !== undefined) updateData.is_available = product.isAvailable
  if (product.isHot !== undefined) updateData.is_hot = product.isHot
  if (product.preparationTime !== undefined) updateData.preparation_time = product.preparationTime

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    categoryId: data.category_id,
    storeId: data.store_id,
    name: data.name,
    description: data.description || undefined,
    price: parseFloat(data.price),
    image: data.image || undefined,
    isAvailable: data.is_available,
    isHot: data.is_hot || false,
    preparationTime: data.preparation_time || 5,
  } as Product
}

// Funções para mesas
export async function getTablesByStoreId(storeId: number, activeOnly: boolean = false) {
  if (!supabaseAdmin) return []
  
  let query = supabaseAdmin
    .from('tables')
    .select('*')
    .eq('store_id', storeId)
  
  if (activeOnly) {
    query = query.eq('is_active', true)
  }
  
  const { data, error } = await query.order('number', { ascending: true })
  
  if (error || !data) return []
  return data.map(table => ({
    id: table.id,
    storeId: table.store_id,
    number: table.number,
    isActive: table.is_active,
  })) as Table[]
}

export async function createTable(table: Omit<Table, 'id'>) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('tables')
    .insert({
      store_id: table.storeId,
      number: table.number,
      is_active: table.isActive,
    })
    .select()
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    storeId: data.store_id,
    number: data.number,
    isActive: data.is_active,
  } as Table
}

export async function updateTable(id: number, table: Partial<Table>) {
  if (!supabaseAdmin) return null
  
  const updateData: any = {}
  if (table.number !== undefined) updateData.number = table.number
  if (table.isActive !== undefined) updateData.is_active = table.isActive
  
  const { data, error } = await supabaseAdmin
    .from('tables')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    storeId: data.store_id,
    number: data.number,
    isActive: data.is_active,
  } as Table
}

export async function deleteTable(id: number) {
  if (!supabaseAdmin) return false
  
  const { error } = await supabaseAdmin
    .from('tables')
    .delete()
    .eq('id', id)
  
  return !error
}

// Funções para pedidos
export async function getOrdersByStoreId(storeId: number, status?: string) {
  if (!supabaseAdmin) return []
  
  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
  
  if (status) {
    const statuses = status.split(',')
    query = query.in('status', statuses)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error || !data) return []
  return data.map(order => ({
    id: order.id,
    storeId: order.store_id,
    orderNumber: order.order_number,
    tableId: order.table_id || null,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    paymentMethod: order.payment_method,
    status: order.status,
    totalAmount: parseFloat(order.total_amount),
    estimatedTime: order.estimated_time,
    receiptId: order.receipt_id || undefined,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
  })) as Order[]
}

export async function getOrdersByPhone(phone: string) {
  if (!supabaseAdmin) return []
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })
  
  if (error || !data) return []
  return data.map(order => ({
    id: order.id,
    storeId: order.store_id,
    orderNumber: order.order_number,
    tableId: order.table_id || null,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    paymentMethod: order.payment_method,
    status: order.status,
    totalAmount: parseFloat(order.total_amount),
    estimatedTime: order.estimated_time,
    receiptId: order.receipt_id || undefined,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
  })) as Order[]
}

export async function getOrderById(id: number) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    storeId: data.store_id,
    orderNumber: data.order_number,
    tableId: data.table_id,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    paymentMethod: data.payment_method,
    status: data.status,
    totalAmount: parseFloat(data.total_amount),
    estimatedTime: data.estimated_time,
    receiptId: data.receipt_id || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as Order
}

export async function getNextOrderNumber(storeId: number): Promise<string> {
  if (!supabaseAdmin) return '#001'
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('order_number')
    .eq('store_id', storeId)
    .order('id', { ascending: false })
    .limit(1)
  
  if (error || !data || data.length === 0) {
    return '#001'
  }
  
  const lastNumber = data[0].order_number
  const numberMatch = lastNumber.match(/#(\d+)/)
  if (!numberMatch) {
    return '#001'
  }
  
  const nextNumber = parseInt(numberMatch[1]) + 1
  return `#${String(nextNumber).padStart(3, '0')}`
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>) {
  if (!supabaseAdmin) return null
  
  const orderNumber = await getNextOrderNumber(order.storeId)
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      store_id: order.storeId,
      order_number: orderNumber,
      table_id: order.tableId || null,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      payment_method: order.paymentMethod,
      status: order.status,
      total_amount: order.totalAmount,
      estimated_time: order.estimatedTime,
      receipt_id: order.receiptId || null,
    })
    .select()
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    storeId: data.store_id,
    orderNumber: data.order_number,
    tableId: data.table_id,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    paymentMethod: data.payment_method,
    status: data.status,
    totalAmount: parseFloat(data.total_amount),
    estimatedTime: data.estimated_time,
    receiptId: data.receipt_id || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as Order
}

export async function updateOrderStatus(id: number, status: Order['status']) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    storeId: data.store_id,
    orderNumber: data.order_number,
    tableId: data.table_id,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    paymentMethod: data.payment_method,
    status: data.status,
    totalAmount: parseFloat(data.total_amount),
    estimatedTime: data.estimated_time,
    receiptId: data.receipt_id || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as Order
}

// Funções para itens do pedido
export async function getOrderItemsByOrderId(orderId: number) {
  if (!supabaseAdmin) return []
  
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
  
  if (error || !data) return []
  return data.map(item => ({
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id,
    quantity: item.quantity,
    price: parseFloat(item.price),
    notes: item.notes || undefined,
  })) as OrderItem[]
}

export async function createOrderItem(item: Omit<OrderItem, 'id'>) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .insert({
      order_id: item.orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes || null,
    })
    .select()
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    orderId: data.order_id,
    productId: data.product_id,
    quantity: data.quantity,
    price: parseFloat(data.price),
    notes: data.notes || undefined,
  } as OrderItem
}

// Funções para comprovantes
export async function createPaymentReceipt(receipt: Omit<PaymentReceipt, 'id' | 'createdAt'>) {
  if (!supabaseAdmin) {
    console.error('Supabase não está configurado')
    return null
  }
  
  console.log('Criando comprovante no banco:', {
    order_id: receipt.orderId,
    payment_method: receipt.paymentMethod,
    receipt_url: receipt.receiptUrl,
    is_approved: receipt.isApproved,
  })
  
  const { data, error } = await supabaseAdmin
    .from('payment_receipts')
    .insert({
      order_id: receipt.orderId,
      payment_method: receipt.paymentMethod,
      receipt_url: receipt.receiptUrl,
      is_approved: receipt.isApproved,
      approved_by: receipt.approvedBy || null,
      approved_at: receipt.approvedAt ? receipt.approvedAt.toISOString() : null,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar comprovante:', error)
    return null
  }
  
  if (!data) {
    console.error('Nenhum dado retornado ao criar comprovante')
    return null
  }
  
  console.log('Comprovante criado com sucesso:', data)
  
  return {
    id: data.id,
    orderId: data.order_id,
    paymentMethod: data.payment_method,
    receiptUrl: data.receipt_url,
    isApproved: data.is_approved,
    approvedBy: data.approved_by || undefined,
    approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
    createdAt: new Date(data.created_at),
  } as PaymentReceipt
}

export async function getPaymentReceiptByOrderId(orderId: number) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('payment_receipts')
    .select('*')
    .eq('order_id', orderId)
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    orderId: data.order_id,
    paymentMethod: data.payment_method,
    receiptUrl: data.receipt_url,
    isApproved: data.is_approved,
    approvedBy: data.approved_by || undefined,
    approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
    createdAt: new Date(data.created_at),
  } as PaymentReceipt
}

export async function approvePaymentReceipt(receiptId: number, approvedBy: number) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('payment_receipts')
    .update({
      is_approved: true,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', receiptId)
    .select()
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    orderId: data.order_id,
    paymentMethod: data.payment_method,
    receiptUrl: data.receipt_url,
    isApproved: data.is_approved,
    approvedBy: data.approved_by || undefined,
    approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
    createdAt: new Date(data.created_at),
  } as PaymentReceipt
}

export async function deleteProduct(id: number) {
  if (!supabaseAdmin) return false
  
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  return !error
}

export async function getProductById(id: number) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    categoryId: data.category_id,
    storeId: data.store_id,
    name: data.name,
    description: data.description || undefined,
    price: parseFloat(data.price),
    image: data.image || undefined,
    isAvailable: data.is_available,
    isHot: data.is_hot || false,
  } as Product
}

// Interface para Review
export interface Review {
  id: number
  productId?: number
  orderId?: number
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

// Funções para reviews
export async function getReviewsByProductId(productId: number) {
  if (!supabaseAdmin) return []
  
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  
  if (error || !data) return []
  return data.map(review => ({
    id: review.id,
    productId: review.product_id || undefined,
    orderId: review.order_id || undefined,
    userName: review.user_name,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.created_at),
  })) as Review[]
}

export async function getReviewsByStoreId(storeId: number) {
  if (!supabaseAdmin) return []
  
  // Buscar reviews através dos produtos da loja
  // Primeiro buscar produtos da loja
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('store_id', storeId)
  
  if (productsError || !products || products.length === 0) return []
  
  const productIds = products.map(p => p.id)
  
  // Buscar reviews dos produtos
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .in('product_id', productIds)
    .order('created_at', { ascending: false })
  
  if (error || !data) return []
  return data.map(review => ({
    id: review.id,
    productId: review.product_id || undefined,
    orderId: review.order_id || undefined,
    userName: review.user_name,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.created_at),
  })) as Review[]
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>) {
  if (!supabaseAdmin) return null
  
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      product_id: review.productId || null,
      order_id: review.orderId || null,
      user_name: review.userName,
      rating: review.rating,
      comment: review.comment,
    })
    .select()
    .single()
  
  if (error || !data) return null
  return {
    id: data.id,
    productId: data.product_id || undefined,
    orderId: data.order_id || undefined,
    userName: data.user_name,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(data.created_at),
  } as Review
}

export async function getAverageRating(productId: number) {
  if (!supabaseAdmin) return 0
  
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
  
  if (error || !data || data.length === 0) return 0
  const sum = data.reduce((acc, r) => acc + r.rating, 0)
  return sum / data.length
}

export async function getReviewCount(productId: number) {
  if (!supabaseAdmin) return 0
  
  const { count, error } = await supabaseAdmin
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
  
  if (error) return 0
  return count || 0
}

