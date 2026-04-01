import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getErrorMessage } from '@/lib/error'
import { DEFAULT_SYSTEM_IDS } from '@/lib/system-access'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/admin/user-roles/[userId] - Get roles for specific user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    const { data: roles, error } = await supabase
      .from('user_system_roles')
      .select('system_id, role')
      .eq('user_id', userId)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }
    
    return NextResponse.json({ roles }, { headers: corsHeaders })
    
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal error: ' + getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PUT /api/admin/user-roles/[userId] - Update multiple system roles for user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { system_roles, system_id, role, username } = body
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Update username if provided
    if (username) {
      // Check if username already exists for another user
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .maybeSingle()
        
      if (existingUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400, headers: corsHeaders })
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId)
        
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update username' }, { status: 500, headers: corsHeaders })
      }
    }

    // Handle batch update (from user management page)
    if (system_roles) {
      for (const systemId of DEFAULT_SYSTEM_IDS) {
        const roleValue = system_roles[systemId] || 'none'
        
        if (roleValue === 'none') {
          await supabase
            .from('user_system_roles')
            .delete()
            .eq('user_id', userId)
            .eq('system_id', systemId)
        } else {
          const { error } = await supabase
            .from('user_system_roles')
            .upsert({
              user_id: userId,
              system_id: systemId,
              role: roleValue,
              granted_at: new Date().toISOString()
            }, { onConflict: 'user_id,system_id' })
          
          if (error) {
            console.warn(`Error updating role for ${systemId}:`, error)
          }
        }
      }
      
      return NextResponse.json({ 
        message: 'User permissions updated successfully',
        system_roles 
      }, { headers: corsHeaders })
    }
    
    // Handle single role update (legacy)
    if (!system_id || !role) {
      return NextResponse.json({ error: 'Missing system_id or role' }, { status: 400, headers: corsHeaders })
    }
    
    const { data, error } = await supabase
      .from('user_system_roles')
      .upsert({
        user_id: userId,
        system_id: system_id,
        role: role,
        granted_at: new Date().toISOString()
      }, { onConflict: 'user_id,system_id' })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }
    
    return NextResponse.json({ role: data }, { headers: corsHeaders })
    
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal error: ' + getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}
