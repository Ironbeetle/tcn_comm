import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

// Sync bulletin to portal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sourceId, title, subject, poster_url, category, userId } = body

    if (!sourceId || !title || !subject || !poster_url || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const portalApiKey = process.env.PORTAL_API_KEY
    const portalApiUrl = process.env.PORTAL_API_URL

    if (!portalApiKey || !portalApiUrl) {
      return NextResponse.json(
        { success: false, error: 'Portal API not configured' },
        { status: 500 }
      )
    }

    // Sync to portal
    const response = await fetch(`${portalApiUrl}/bulletin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': portalApiKey,
      },
      body: JSON.stringify({
        sourceId,
        title,
        subject,
        poster_url,
        category,
        userId,
        created: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Portal API error: ${error}`)
    }

    const data = await response.json()

    // Update local bulletin with poster_url
    await prisma.bulletinApiLog.update({
      where: { id: sourceId },
      data: { poster_url },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error syncing bulletin:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to sync bulletin' },
      { status: 500 }
    )
  }
}
