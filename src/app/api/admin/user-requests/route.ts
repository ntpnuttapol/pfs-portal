import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getErrorMessage } from '@/lib/error'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/admin/user-requests - List all pending requests
export async function GET() {
  try {
    // Use service role to bypass auth/RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Get requests
    const { data: requests, error } = await supabase
      .from('user_requests')
      .select('*')
      .order('requested_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }
    
    return NextResponse.json({ requests }, { headers: corsHeaders })
    
  } catch (error: unknown) {
    console.error('Get user requests error:', error)
    return NextResponse.json(
      { error: 'Internal error: ' + getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/admin/user-requests - Submit new request (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, full_name, password_hash } = body
    
    if (!email || !username || !password_hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders })
    }
    
    // Use service role to bypass auth/RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Check if email or username already exists in profiles
    const { data: existing } = await supabase
      .from('profiles')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle()
    
    if (existing) {
      return NextResponse.json({ error: 'Email or username already registered' }, { status: 409, headers: corsHeaders })
    }
    
    // Check if already requested
    const { data: existingRequest } = await supabase
      .from('user_requests')
      .select('id, status')
      .or(`email.eq.${email},username.eq.${username}`)
      .eq('status', 'pending')
      .maybeSingle()
    
    if (existingRequest) {
      return NextResponse.json({ error: 'Request already pending' }, { status: 409, headers: corsHeaders })
    }
    
    // Create request
    const { data, error } = await supabase
      .from('user_requests')
      .insert({ email, username, full_name, password_hash, status: 'pending' })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }
    
    return NextResponse.json({ request: data, message: 'Request submitted. Waiting for admin approval.' }, { headers: corsHeaders })
    
  } catch (error: unknown) {
    console.error('Create user request error:', error)
    return NextResponse.json(
      { error: 'Internal error: ' + getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}
