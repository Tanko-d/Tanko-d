import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, reason } = body

    return NextResponse.json({
      id: requestId,
      status: 'REJECTED',
      reason: reason || null,
      rejectedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
