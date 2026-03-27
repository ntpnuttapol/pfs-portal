import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import jwt from 'jsonwebtoken'

const SSO_SECRET = process.env.SSO_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-secret'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { systemId, targetUrl, userMapping } = body

    if (!systemId || !targetUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: systemId, targetUrl' },
        { status: 400 }
      )
    }

    // Create SSO payload
    const ssoPayload = {
      hubUserId: user.id,
      hubEmail: user.email,
      hubUserMetadata: user.user_metadata,
      systemId,
      // User mapping for target system (e.g., { localUsername: 'john.doe', localEmail: 'john@company.com' })
      userMapping: userMapping || {},
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiration
    }

    // Generate SSO token
    const ssoToken = jwt.sign(ssoPayload, SSO_SECRET)

    // Construct redirect URL with token
    const separator = targetUrl.includes('?') ? '&' : '?'
    const redirectUrl = `${targetUrl}${separator}sso_token=${encodeURIComponent(ssoToken)}&hub_origin=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')}`

    return NextResponse.json({
      success: true,
      token: ssoToken,
      redirectUrl,
      expiresIn: '5 minutes',
    })

  } catch (error) {
    console.error('SSO Token generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
