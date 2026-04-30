import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始数据库种子数据填充...')

  // 从环境变量获取演示密码，或使用安全默认值
  const demoPassword = process.env.NEXUS_DEMO_PASSWORD || 'demo123_secure'
  const adminPassword = process.env.NEXUS_ADMIN_PASSWORD || 'admin123_secure'

  // 创建测试用户
  const demoUser = await prisma.user.upsert({
    where: { email: 'next_design@openaigc.fun' },
    update: {},
    create: {
      email: 'next_design@openaigc.fun',
      name: '测试用户',
      password: await bcrypt.hash(demoPassword, 12),
      role: 'USER',
      emailVerified: new Date(),
    },
  })
  console.log('✅ 测试用户已创建:', demoUser.email)

  // 创建管理员用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@openaigc.fun' },
    update: {},
    create: {
      email: 'admin@openaigc.fun',
      name: '管理员',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('✅ 管理员用户已创建:', adminUser.email)

  // 创建示例项目
  const sampleProject = await prisma.project.create({
    data: {
      name: '示例设计项目',
      description: '这是一个示例项目，用于演示功能',
      ownerId: demoUser.id,
      settings: JSON.parse(JSON.stringify({
        theme: 'dark',
        devices: ['iphone-14-pro', 'desktop'],
        plugins: {
          aiAssistant: true,
          collaboration: true
        }
      })),
      data: JSON.parse(JSON.stringify({
        canvas: {
          width: 375,
          height: 812,
          zoom: 1
        },
        elements: [
          {
            id: 'element-1',
            type: 'button',
            x: 20,
            y: 100,
            width: 335,
            height: 48,
            props: { text: '开始使用' },
            styles: { background: '#6366f1', color: '#ffffff' }
          }
        ]
      }))
    }
  })
  console.log('✅ 示例项目已创建:', sampleProject.name)

  // 创建示例版本
  await prisma.version.create({
    data: {
      projectId: sampleProject.id,
      version: 1,
      data: JSON.parse(JSON.stringify(sampleProject.data)),
      createdBy: demoUser.id,
      message: '初始版本'
    }
  })
  console.log('✅ 示例版本已创建')

  console.log('\n🎉 数据库种子数据填充完成！')
  console.log('\n测试账号信息:')
  console.log('邮箱: next_design@openaigc.fun')
  console.log('密码:', process.env.NEXUS_DEMO_PASSWORD || 'demo123_secure')
  console.log('\n管理员账号信息:')
  console.log('邮箱: admin@openaigc.fun')
  console.log('密码:', process.env.NEXUS_ADMIN_PASSWORD || 'admin123_secure')
}

main()
  .catch((e) => {
    console.error('种子数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })