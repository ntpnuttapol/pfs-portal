import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getErrorMessage } from '@/lib/error'

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// POST /api/auth/signup-request - Public signup request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, full_name, password } = body

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey)
    console.log('SUPABASE_SERVICE_ROLE_KEY length:', supabaseServiceKey?.length)
    
    // Create admin client with service role
    console.log('Creating admin client...')
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Check if email/username already in profiles
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Email or username already registered' },
        { status: 409, headers: corsHeaders }
      )
    }

    // Check pending request
    const { data: existingRequest } = await adminClient
      .from('user_requests')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Request already pending approval' },
        { status: 409, headers: corsHeaders }
      )
    }

    // Create request using service role (bypasses RLS)
    const { data, error } = await adminClient
      .from('user_requests')
      .insert({
        email,
        username,
        full_name,
        password_hash: password,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Registration request submitted successfully',
        request: data 
      },
      { headers: corsHeaders }
    )

  } catch (error: unknown) {
    console.error('Signup request error:', error)
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error: ' + getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}
