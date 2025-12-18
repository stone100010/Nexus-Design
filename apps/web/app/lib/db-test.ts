import { prisma } from './db'

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean
  message: string
  version?: string
  error?: string
}> {
  try {
    // 尝试查询用户数量来测试连接
    const userCount = await prisma.user.count()
    
    // 尝试获取 PostgreSQL 版本
    const result = await prisma.$queryRaw`SELECT version()` as any[]
    const version = result[0]?.version || 'Unknown'
    
    return {
      success: true,
      message: `数据库连接成功！当前用户数: ${userCount}`,
      version: version
    }
  } catch (error) {
    return {
      success: false,
      message: '数据库连接失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 获取数据库统计信息
 */
export async function getDatabaseStats() {
  try {
    const stats = {
      users: await prisma.user.count(),
      projects: await prisma.project.count(),
      teams: await prisma.team.count(),
      versions: await prisma.version.count(),
      components: await prisma.component.count(),
      aiGenerations: await prisma.aIGeneration.count(),
      comments: await prisma.comment.count(),
    }
    
    return { success: true, stats }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }
  }
}

/**
 * 检查必需的表是否存在
 */
export async function checkTablesExist(): Promise<{
  success: boolean
  missingTables?: string[]
  error?: string
}> {
  try {
    // 在 PostgreSQL 中查询所有表
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    
    const existingTables = (tables as any[]).map((t: any) => t.table_name)
    const requiredTables = [
      'users', 'sessions', 'teams', 'team_members', 'projects', 
      'project_members', 'versions', 'components', 'ai_generations',
      'collaboration_sessions', 'comments', 'files', 'audit_logs'
    ]
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))
    
    return {
      success: missingTables.length === 0,
      missingTables: missingTables.length > 0 ? missingTables : undefined
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
