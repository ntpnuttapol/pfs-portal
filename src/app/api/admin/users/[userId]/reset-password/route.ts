import { NextRequest, NextResponse } from 'next/server'
import { createClient as createHubClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getErrorMessage } from '@/lib/error'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function generateTemporaryPassword(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

async function verifyAdmin() {
  const hubClient = await createHubClient()
  const { data: { user }, error } = await hubClient.auth.getUser()

  if (error || !user) {
    return null
  }

  const serviceClient = createServiceClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || profile?.role !== 'admin') {
    return null
  }

  return user
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const serviceClient = createServiceClient()

    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, username, full_name')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: authUserData, error: authLookupError } = await serviceClient.auth.admin.getUserById(userId)

    if (authLookupError || !authUserData.user) {
      return NextResponse.json({ error: authLookupError?.message || 'Auth user not found' }, { status: 404 })
    }

    const temporaryPassword = generateTemporaryPassword()
    const nextUserMetadata = {
      ...(authUserData.user.user_metadata ?? {}),
      must_change_password: true,
      temporary_password_issued_at: new Date().toISOString(),
      temporary_password_reset_by: adminUser.id,
    }

    const { error: updateError } = await serviceClient.auth.admin.updateUserById(userId, {
      password: temporaryPassword,
      user_metadata: nextUserMetadata,
    })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      temporaryPassword,
      user: {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
      },
      message: 'Temporary password generated successfully',
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal error: ' + getErrorMessage(error) },
      { status: 500 }
    )
  }
}
