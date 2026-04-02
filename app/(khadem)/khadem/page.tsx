import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { openSession, closeSession } from './actions'
import { Clock, CheckCircle2, Play, Lock } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function KhademHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  // Check if a session already exists today
  const { data: session } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('khadem_id', user.id)
    .eq('date', today)
    .maybeSingle()

  const isSessionOpen = session && !session.is_closed

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-display font-semibold mb-2">
            Welcome, {profile?.full_name || 'Khadem'}
          </h1>
          <p className="text-[var(--color-text-muted)]">
            A new day begins. Make sure your drawer is balanced before starting.
          </p>
        </div>

        <Card className="w-full text-left shadow-sm">
          {!session ? (
            <>
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={24} />
                </div>
                <CardTitle>Session Not Started</CardTitle>
                <CardDescription>You haven't opened a session for today ({new Date().toLocaleDateString()}).</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-4">
                <form action={openSession} className="w-full">
                  <Button type="submit" size="lg" className="w-full h-14 text-lg gap-2">
                    <Play size={20} />
                    Open Daily Shift
                  </Button>
                </form>
              </CardContent>
            </>
          ) : isSessionOpen ? (
            <>
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <CardTitle>Session Active</CardTitle>
                <CardDescription>Your session for {new Date(session.date).toLocaleDateString()} is open.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Link href="/khadem/pos" className="w-full block">
                  <Button size="lg" className="w-full h-14 text-lg gap-2">
                    Continue to POS
                  </Button>
                </Link>
                <form action={closeSession.bind(null, session.id)} className="w-full">
                  <Button type="submit" variant="outline" className="w-full text-[var(--color-error)] border-[var(--color-error)] hover:bg-red-50">
                    <Lock size={16} className="mr-2" />
                    Close Shift
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} />
                </div>
                <CardTitle>Shift Closed</CardTitle>
                <CardDescription>You have already closed your shift for today. Enjoy the rest of your day!</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-4 text-center pb-8">
                <p className="text-sm text-[var(--color-text-muted)]">Come back tomorrow to open a new session.</p>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
