import { NextRequest, NextResponse } from 'next/server'
import { createClient as createHubClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Hr-Employee Supabase connection (separate project)
function getHrSupabase() {
  const url = process.env.HR_SUPABASE_URL
  const key = process.env.HR_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('HR_SUPABASE_URL and HR_SUPABASE_ANON_KEY must be set')
  }
  return createClient(url, key)
}

// Verify user is Hub admin
async function verifyAdmin() {
  const supabase = await createHubClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// GET: Fetch Hr-Employee users
export async function GET() {
  try {
    const user = await verifyAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hrSupabase = getHrSupabase()

    const { data: hrUsers, error } = await hrSupabase
      .from('users')
      .select('id, username, full_name, email, role, is_active, hub_user_id')
      .order('username')

    if (error) {
      console.error('Error fetching HR users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: hrUsers || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT: Link/Unlink Hub user to Hr-Employee user
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hrUserId, hubUserId } = await request.json()

    if (!hrUserId) {
      return NextResponse.json({ error: 'hrUserId is required' }, { status: 400 })
    }

    const hrSupabase = getHrSupabase()

    const { error } = await hrSupabase
      .from('users')
      .update({ hub_user_id: hubUserId || null })
      .eq('id', hrUserId)

    if (error) {
      console.error('Error updating HR user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
