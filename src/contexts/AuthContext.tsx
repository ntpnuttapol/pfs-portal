'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

const supabase = createClient()

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  role: string | null
  isAdmin: boolean
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>
  signUp: (username: string, email: string, password: string, fullName: string) => Promise<{ error: Error | null; pendingApproval?: boolean; message?: string }>
  signOut: () => Promise<void>
  isLoginModalOpen: boolean
  setIsLoginModalOpen: (isOpen: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const syncAuthState = async (nextSession: Session | null) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (!nextSession?.user) {
        setRole(null)
        setIsLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', nextSession.user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Profile role lookup error:', profileError)
        setRole(null)
      } else {
        setRole(profile?.role ?? null)
      }

      setIsLoading(false)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncAuthState(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void syncAuthState(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (username: string, password: string) => {
    console.log('SignIn attempt:', username)
    
    // First, lookup email from username via profiles table
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single()

    console.log('Profile lookup:', { profile, lookupError })

    if (lookupError) {
      console.error('Profile lookup error:', lookupError)
      return { error: new Error('Invalid username or password') }
    }

    if (!profile?.email) {
      console.error('No email found for username:', username)
      return { error: new Error('Invalid username or password') }
    }

    console.log('Signing in with email:', profile.email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })
    
    if (error) {
      console.error('Auth signIn error:', error)
    }
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // NEW: Sign Up function - Creates a request for admin approval instead of immediate user creation
  const signUp = async (username: string, email: string, password: string, fullName: string) => {
    try {
      console.log('SignUp attempt:', { username, email, fullName })
      
      // 1. Check if username already exists in approved profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()

      if (existingProfile) {
        return { error: new Error('Username already exists') }
      }

      // 2. Check if email already exists in approved profiles
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (existingEmail) {
        return { error: new Error('Email already registered') }
      }

      // 3. Check if there's already a pending request
      const { data: existingRequest } = await supabase
        .from('user_requests')
        .select('id, status')
        .or(`email.eq.${email},username.eq.${username}`)
        .eq('status', 'pending')
        .maybeSingle()

      if (existingRequest) {
        return { error: new Error('A registration request is already pending approval') }
      }

      // 4. Create user request via API (bypasses RLS with service role)
      console.log('Creating user request...')
      const response = await fetch('/api/auth/signup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          full_name: fullName,
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        return { error: new Error(result.error || 'Failed to submit registration request') }
      }

      console.log('SignUp request submitted successfully:', result)
      
      // Return special success message indicating pending approval
      return { 
        error: null, 
        pendingApproval: true,
        message: 'Your registration request has been submitted and is pending admin approval.'
      }
    } catch (err) {
      console.error('SignUp exception:', err)
      return { error: err as Error }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    role,
    isAdmin: role === 'admin',
    signIn,
    signUp,
    signOut,
    isLoginModalOpen,
    setIsLoginModalOpen,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { supabase }
