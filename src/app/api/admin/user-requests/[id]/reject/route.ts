import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// POST /api/admin/user-requests/[id]/reject
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body
    
    const supabase = await createClient()
    
    // Check admin
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }
    
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('id', adminUser.id)
      .single()
    
    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403, headers: corsHeaders })
    }
    
    // Update request status
    const { data: updated, error } = await supabase
      .from('user_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: adminProfile.id,
        rejection_reason: reason || 'No reason provided'
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }
    
    return NextResponse.json({
      message: 'Request rejected',
      request: updated
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Reject error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: corsHeaders })
  }
}
