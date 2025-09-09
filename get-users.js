const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://police_admin:StrongPassword123!@103.13.206.9:3306/police_inventory"
    }
  }
})

async function getUsers() {
  try {
    console.log('🔍 Fetching all approved users from production database...\n')
    
    const users = await prisma.user.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        email: true,
        nrp: true,
        role: true,
        status: true,
        password: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📋 APPROVED USERS - LOGIN CREDENTIALS:\n')
    console.log('=' .repeat(80))
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔑 Password: admin123456 (default)`)
      console.log(`   🆔 NRP: ${user.nrp}`)
      console.log(`   👤 Role: ${user.role}`)
      console.log(`   ✅ Status: ${user.status}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log('   ' + '-'.repeat(60))
    })
    
    console.log(`\n🎯 Total Approved Users: ${users.length}`)
    console.log('\n💡 Note: All users use default password "admin123456"')
    console.log('🌐 Login at: https://police-inventory.vercel.app/')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

getUsers()
