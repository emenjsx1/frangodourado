'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="bg-red-strong min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border-2 border-red-dark">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo-frango-dourado.png" 
            alt="Logo Frango Dourado"
            className="h-16 w-auto mb-4 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <h1 className="text-3xl font-bold text-black-dark text-center">
        
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-black-dark font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
            />
          </div>
          <div>
            <label className="block text-black-dark font-semibold mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-strong text-white py-2 px-4 rounded font-semibold hover:bg-red-dark transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <p className="text-center text-sm text-black-dark mt-4 opacity-70">
          Cadastros são feitos manualmente pelo administrador
        </p>
      </div>
    </div>
  )
}


