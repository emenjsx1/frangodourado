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
  } as Product
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

