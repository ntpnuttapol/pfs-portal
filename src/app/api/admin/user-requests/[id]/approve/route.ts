import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getErrorMessage } from '@/lib/error'
import { DEFAULT_SYSTEM_IDS } from '@/lib/system-access'

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

// POST /api/admin/user-requests/[id]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { system_roles } = body

    // Use service role for all operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get the request
    const { data: requestData, error: reqError } = await supabase
      .from('user_requests')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single()

    if (reqError || !requestData) {
      return NextResponse.json({ error: 'Request not found or already processed' }, { status: 404, headers: corsHeaders })
    }

    // Create auth user using service role (bypasses all restrictions)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password_hash, // Plain password from request
      email_confirm: true,
      user_metadata: {
        username: requestData.username,
        full_name: requestData.full_name,
      }
    })

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json({ error: 'Failed to create auth user: ' + authError?.message }, { status: 500, headers: corsHeaders })
    }

    const userId = authData.user.id

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: requestData.username,
        email: requestData.email,
        full_name: requestData.full_name,
        role: 'user',
        status: 'active'
      })

    if (profileError) {
      console.warn('Profile creation error:', profileError)
    }

    // Assign system roles
    const rolesToAssign = system_roles || {}

    for (const systemId of DEFAULT_SYSTEM_IDS) {
      const role = rolesToAssign[systemId] || 'viewer'
      if (role !== 'none') {
        const { error: roleError } = await supabase.from('user_system_roles').upsert({
          user_id: userId,
          system_id: systemId,
          role: role,
          granted_at: new Date().toISOString()
        }, { onConflict: 'user_id,system_id' })
        
        if (roleError) {
          console.warn(`Error assigning role for ${systemId}:`, roleError)
        }
      }
    }

    // Update request status
    const { data: updated } = await supabase
      .from('user_requests')
      .update({
        status: 'approved',
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return NextResponse.json({
      message: 'User approved and account created successfully',
      request: updated,
      user_id: userId,
      system_roles: rolesToAssign
    }, { headers: corsHeaders })

  } catch (error: unknown) {
    console.error('Approve error:', error)
    return NextResponse.json(
      { error: 'Internal error: ' + getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}
