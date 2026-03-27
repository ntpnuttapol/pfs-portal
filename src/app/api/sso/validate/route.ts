import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const SSO_SECRET = process.env.SSO_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-secret'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, systemId } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify the token
    const decoded = jwt.verify(token, SSO_SECRET) as {
      hubUserId: string
      hubEmail: string
      hubUserMetadata: Record<string, unknown>
      systemId: string
      userMapping: Record<string, string>
      iat: number
      exp: number
    }

    // Optional: Verify system ID matches
    if (systemId && decoded.systemId !== systemId) {
      return NextResponse.json(
        { error: 'Invalid system ID' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Get user system roles from database (use service role to bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    console.log('SSO Validate - hubUserId:', decoded.hubUserId, 'systemId:', systemId)
    
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_system_roles')
      .select('system_id, role')
      .eq('user_id', decoded.hubUserId)

    console.log('SSO Validate - userRoles:', userRoles, 'error:', rolesError)

    if (rolesError) {
      console.warn('Error fetching user roles:', rolesError)
    }

    // Convert to role mapping
    const roleMapping: Record<string, string> = {}
    userRoles?.forEach((r) => {
      roleMapping[r.system_id] = r.role
    })

    console.log('SSO Validate - roleMapping:', roleMapping)

    // Check if user has access to requested system
    const requestedSystemRole = systemId ? roleMapping[systemId] : null
    console.log('SSO Validate - requestedSystemRole:', requestedSystemRole)
    
    if (systemId && (!requestedSystemRole || requestedSystemRole === 'none')) {
      console.log('SSO Validate - ACCESS DENIED for system:', systemId)
      return NextResponse.json(
        { error: 'Access denied for this system', code: 'NO_SYSTEM_ACCESS' },
        { status: 403, headers: corsHeaders }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        hubUserId: decoded.hubUserId,
        hubEmail: decoded.hubEmail,
        hubUserMetadata: decoded.hubUserMetadata,
        systemId: decoded.systemId,
        userMapping: decoded.userMapping,
        systemRoles: roleMapping,
        requestedSystemRole: requestedSystemRole,
      },
    }, { headers: corsHeaders })

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401, headers: corsHeaders }
      )
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: corsHeaders }
      )
    }
    
    console.error('SSO validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
