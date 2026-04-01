import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getErrorMessage } from '@/lib/error'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/admin/users - List all users with their system roles
export async function GET() {
  try {
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey)
    console.log('SUPABASE_URL:', supabaseUrl?.substring(0, 20))
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get all users (any status) with profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, email, full_name, role, status, created_at')
      .order('created_at', { ascending: false })

    console.log('Users query result:', { count: users?.length, error: usersError?.message })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500, headers: corsHeaders })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] }, { headers: corsHeaders })
    }

    // Get all system roles for these users
    const userIds = users.map(u => u.id)
    const { data: roles, error: rolesError } = await supabase
      .from('user_system_roles')
      .select('user_id, system_id, role')
      .in('user_id', userIds)

    console.log('Roles query result:', { count: roles?.length, error: rolesError?.message })

    // Combine users with their roles
    const usersWithRoles = users?.map(user => {
      const userRoles: Record<string, string> = {}
      roles?.forEach(r => {
        if (r.user_id === user.id) {
          userRoles[r.system_id] = r.role
        }
      })
      
      return {
        ...user,
        system_roles: userRoles
      }
    })

    return NextResponse.json({ users: usersWithRoles }, { headers: corsHeaders })

  } catch (error: unknown) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal error: ' + getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}
