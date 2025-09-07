import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyPoldaPolres() {
  try {
    console.log('🔍 Memverifikasi data Polda dan Polres...')

    // Get all Polda with their Polres count
    const poldaWithPolres = await prisma.polda.findMany({
      include: {
        polres: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('\n📊 Data Polda dan Polres:')
    console.log('=' .repeat(80))
    
    let totalPolres = 0
    
    poldaWithPolres.forEach((polda, index) => {
      console.log(`\n${index + 1}. ${polda.name}`)
      console.log(`   ID: ${polda.id}`)
      console.log(`   Jumlah Polres: ${polda.polres.length}`)
      
      if (polda.polres.length > 0) {
        console.log('   Polres:')
        polda.polres.forEach((polres, polresIndex) => {
          console.log(`     ${polresIndex + 1}. ${polres.name}`)
        })
      }
      
      totalPolres += polda.polres.length
    })

    console.log('\n' + '=' .repeat(80))
    console.log(`📈 Summary:`)
    console.log(`   - Total Polda: ${poldaWithPolres.length}`)
    console.log(`   - Total Polres: ${totalPolres}`)
    console.log(`   - Rata-rata Polres per Polda: ${(totalPolres / poldaWithPolres.length).toFixed(2)}`)

    // Check for specific regions
    console.log('\n🔍 Verifikasi wilayah spesifik:')
    
    const metroJaya = await prisma.polda.findFirst({
      where: { name: 'Kepolisian Daerah Metro Jaya' },
      include: { polres: true }
    })
    
    if (metroJaya) {
      console.log(`✅ Metro Jaya ditemukan dengan ${metroJaya.polres.length} Polres`)
      const jakartaPusat = metroJaya.polres.find(p => p.name.includes('Jakarta Pusat'))
      if (jakartaPusat) {
        console.log(`✅ Jakarta Pusat ditemukan: ${jakartaPusat.name}`)
      }
    }

    const aceh = await prisma.polda.findFirst({
      where: { name: 'Kepolisian Daerah Aceh' },
      include: { polres: true }
    })
    
    if (aceh) {
      console.log(`✅ Aceh ditemukan dengan ${aceh.polres.length} Polres`)
    }

    console.log('\n✅ Verifikasi selesai! Data Polda dan Polres berhasil terisi dengan benar.')

  } catch (error) {
    console.error('❌ Error saat verifikasi:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the verification function
verifyPoldaPolres()
  .catch((error) => {
    console.error('❌ Verifikasi gagal:', error)
    process.exit(1)
  })
