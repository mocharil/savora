import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params

    if (!tableId) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('tables')
      .select('id, table_number, table_name, location')
      .eq('id', tableId)
      .single()

    if (error) {
      console.error('Table fetch error:', error)
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Table API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch table' },
      { status: 500 }
    )
  }
}
