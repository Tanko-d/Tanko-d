import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, approvedAmount } = body

    return NextResponse.json({
      id: requestId,
      status: 'APPROVED',
      approvedAmount: approvedAmount || 0,
      approvedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
