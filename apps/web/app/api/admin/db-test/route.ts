import { NextRequest, NextResponse } from 'next/server'

import { checkTablesExist,getDatabaseStats, testDatabaseConnection } from '@/lib/db-test'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'connection':
        const connectionResult = await testDatabaseConnection()
        return NextResponse.json(connectionResult)

      case 'stats':
        const statsResult = await getDatabaseStats()
        return NextResponse.json(statsResult)

      case 'tables':
        const tablesResult = await checkTablesExist()
        return NextResponse.json(tablesResult)

      case 'status':
      default:
        const [connection, stats, tables] = await Promise.all([
          testDatabaseConnection(),
          getDatabaseStats(),
          checkTablesExist()
        ])
        
        return NextResponse.json({
          success: connection.success && tables.success,
          connection,
          stats: stats.success ? stats.stats : null,
          tables,
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
