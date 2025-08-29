import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Polda
  const polda = await prisma.polda.create({
    data: {
      name: 'Polda Metro Jaya'
    }
  })

  // Create Polres
  const polres = await prisma.polres.create({
    data: {
      name: 'Polres Jakarta Selatan',
      poldaId: polda.id
    }
  })

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@police-inventory.com',
      nrp: 'ADMIN001',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
      polresId: polres.id
    }
  })

  // Create sample assets
  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        name: 'Mobil Patroli Toyota Avanza',
        category: 'KENDARAAN',
        status: 'ACTIVE',
        polresId: polres.id
      }
    }),
    prisma.asset.create({
      data: {
        name: 'Senjata Pistol Glock 17',
        category: 'SENJATA',
        status: 'ACTIVE',
        polresId: polres.id
      }
    }),
    prisma.asset.create({
      data: {
        name: 'Laptop Dell Latitude',
        category: 'KOMPUTER',
        status: 'ACTIVE',
        polresId: polres.id
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log('📧 Admin login: admin@police-inventory.com')
  console.log('🔑 Password: admin123')
  console.log('🏢 Polda created:', polda.name)
  console.log('🏛️ Polres created:', polres.name)
  console.log('📦 Assets created:', assets.length)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
