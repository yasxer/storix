'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Store, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error: authError, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError

      // Fetch user profile to route properly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      // Redirect based on role
      if (profile && profile.role === 'admin') {
        router.push('/admin')
      } else if (profile && profile.role === 'khadem') {
        router.push('/khadem')
      } else {
        router.push('/')
      }
      
      router.refresh()
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Failed to sign in. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white border border-[#e5e5e5] rounded-lg shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#01696f] text-white rounded-lg flex items-center justify-center mb-4">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#111111] font-display">Sign in to Dashboard</h1>
          <p className="text-[#6b6b6b] mt-2">Enter your email and password to access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#b91c1c]/10 border border-[#b91c1c]/20 text-[#b91c1c] rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded focus:outline-none focus:border-[#01696f] focus:ring-1 focus:ring-[#01696f] transition-colors bg-white text-[#111111]"
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#b91c1c]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded focus:outline-none focus:border-[#01696f] focus:ring-1 focus:ring-[#01696f] transition-colors bg-white text-[#111111]"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[#b91c1c]">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#01696f] hover:bg-[#0c4e54] text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

