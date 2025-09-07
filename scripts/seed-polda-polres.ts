import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Data Polda dan Polres berdasarkan struktur organisasi kepolisian Indonesia
const poldaData = [
  {
    code: 'P.D. Aceh',
    name: 'Kepolisian Daerah Aceh',
    polres: [
      { code: 'P.R. Aceh Besar', name: 'Kepolisian Resor Aceh Besar' },
      { code: 'P.R. Aceh Barat', name: 'Kepolisian Resor Aceh Barat' },
      { code: 'P.R. Aceh Selatan', name: 'Kepolisian Resor Aceh Selatan' },
      { code: 'P.R. Aceh Tenggara', name: 'Kepolisian Resor Aceh Tenggara' },
      { code: 'P.R. Aceh Timur', name: 'Kepolisian Resor Aceh Timur' },
      { code: 'P.R. Aceh Utara', name: 'Kepolisian Resor Aceh Utara' },
      { code: 'P.R. Bener Meriah', name: 'Kepolisian Resor Bener Meriah' },
      { code: 'P.R. Bireuen', name: 'Kepolisian Resor Bireuen' },
      { code: 'P.R. Gayo Lues', name: 'Kepolisian Resor Gayo Lues' },
      { code: 'P.R. Aceh Jaya', name: 'Kepolisian Resor Aceh Jaya' },
      { code: 'P.R. Nagan Raya', name: 'Kepolisian Resor Nagan Raya' },
      { code: 'P.R. Pidie', name: 'Kepolisian Resor Pidie' },
      { code: 'P.R. Simeulue', name: 'Kepolisian Resor Simeulue' },
      { code: 'P.R. Aceh Singkil', name: 'Kepolisian Resor Aceh Singkil' },
      { code: 'P.R. Subulussalam', name: 'Kepolisian Resor Subulussalam' },
      { code: 'P.R. Langsa', name: 'Kepolisian Resor Langsa' },
      { code: 'P.R. Lhokseumawe', name: 'Kepolisian Resor Lhokseumawe' },
      { code: 'P.R. Sabang', name: 'Kepolisian Resor Sabang' },
      { code: 'P.R. Banda Aceh', name: 'Kepolisian Resor Banda Aceh' }
    ]
  },
  {
    code: 'P.D. Sumatera Utara',
    name: 'Kepolisian Daerah Sumatera Utara',
    polres: [
      { code: 'P.R. Deli Serdang', name: 'Kepolisian Resor Deli Serdang' },
      { code: 'P.R. Medan', name: 'Kepolisian Resor Medan' },
      { code: 'P.R. Binjai', name: 'Kepolisian Resor Binjai' },
      { code: 'P.R. Langkat', name: 'Kepolisian Resor Langkat' },
      { code: 'P.R. Serdang Bedagai', name: 'Kepolisian Resor Serdang Bedagai' },
      { code: 'P.R. Tebing Tinggi', name: 'Kepolisian Resor Tebing Tinggi' },
      { code: 'P.R. Simalungun', name: 'Kepolisian Resor Simalungun' },
      { code: 'P.R. Pematang Siantar', name: 'Kepolisian Resor Pematang Siantar' },
      { code: 'P.R. Asahan', name: 'Kepolisian Resor Asahan' },
      { code: 'P.R. Tanjung Balai', name: 'Kepolisian Resor Tanjung Balai' },
      { code: 'P.R. Labuhan Batu', name: 'Kepolisian Resor Labuhan Batu' },
      { code: 'P.R. Tapanuli Selatan', name: 'Kepolisian Resor Tapanuli Selatan' },
      { code: 'P.R. Padang Sidempuan', name: 'Kepolisian Resor Padang Sidempuan' },
      { code: 'P.R. Mandailing Natal', name: 'Kepolisian Resor Mandailing Natal' },
      { code: 'P.R. Tapanuli Utara', name: 'Kepolisian Resor Tapanuli Utara' },
      { code: 'P.R. Humbang Hasundutan', name: 'Kepolisian Resor Humbang Hasundutan' },
      { code: 'P.R. Toba Samosir', name: 'Kepolisian Resor Toba Samosir' },
      { code: 'P.R. Samosir', name: 'Kepolisian Resor Samosir' },
      { code: 'P.R. Dairi', name: 'Kepolisian Resor Dairi' },
      { code: 'P.R. Pakpak Bharat', name: 'Kepolisian Resor Pakpak Bharat' },
      { code: 'P.R. Karo', name: 'Kepolisian Resor Karo' },
      { code: 'P.R. Nias', name: 'Kepolisian Resor Nias' },
      { code: 'P.R. Nias Selatan', name: 'Kepolisian Resor Nias Selatan' },
      { code: 'P.R. Nias Utara', name: 'Kepolisian Resor Nias Utara' },
      { code: 'P.R. Nias Barat', name: 'Kepolisian Resor Nias Barat' }
    ]
  },
  {
    code: 'P.D. Metro Jaya',
    name: 'Kepolisian Daerah Metro Jaya',
    polres: [
      { code: 'P.R. Jakarta Pusat', name: 'Kepolisian Resor Jakarta Pusat' },
      { code: 'P.R. Jakarta Utara', name: 'Kepolisian Resor Jakarta Utara' },
      { code: 'P.R. Jakarta Barat', name: 'Kepolisian Resor Jakarta Barat' },
      { code: 'P.R. Jakarta Selatan', name: 'Kepolisian Resor Jakarta Selatan' },
      { code: 'P.R. Jakarta Timur', name: 'Kepolisian Resor Jakarta Timur' },
      { code: 'P.R. Bekasi Kota', name: 'Kepolisian Resor Bekasi Kota' },
      { code: 'P.R. Bekasi', name: 'Kepolisian Resor Bekasi' },
      { code: 'P.R. Depok', name: 'Kepolisian Resor Depok' },
      { code: 'P.R. Tangerang Kota', name: 'Kepolisian Resor Tangerang Kota' },
      { code: 'P.R. Tangerang Selatan', name: 'Kepolisian Resor Tangerang Selatan' },
      { code: 'P.R. Tangerang', name: 'Kepolisian Resor Tangerang' }
    ]
  },
  {
    code: 'P.D. Jawa Barat',
    name: 'Kepolisian Daerah Jawa Barat',
    polres: [
      { code: 'P.R. Bandung', name: 'Kepolisian Resor Bandung' },
      { code: 'P.R. Bandung Barat', name: 'Kepolisian Resor Bandung Barat' },
      { code: 'P.R. Cimahi', name: 'Kepolisian Resor Cimahi' },
      { code: 'P.R. Sumedang', name: 'Kepolisian Resor Sumedang' },
      { code: 'P.R. Subang', name: 'Kepolisian Resor Subang' },
      { code: 'P.R. Purwakarta', name: 'Kepolisian Resor Purwakarta' },
      { code: 'P.R. Karawang', name: 'Kepolisian Resor Karawang' },
      { code: 'P.R. Cirebon', name: 'Kepolisian Resor Cirebon' },
      { code: 'P.R. Indramayu', name: 'Kepolisian Resor Indramayu' },
      { code: 'P.R. Majalengka', name: 'Kepolisian Resor Majalengka' },
      { code: 'P.R. Kuningan', name: 'Kepolisian Resor Kuningan' },
      { code: 'P.R. Bogor', name: 'Kepolisian Resor Bogor' },
      { code: 'P.R. Sukabumi', name: 'Kepolisian Resor Sukabumi' },
      { code: 'P.R. Cianjur', name: 'Kepolisian Resor Cianjur' },
      { code: 'P.R. Garut', name: 'Kepolisian Resor Garut' },
      { code: 'P.R. Tasikmalaya', name: 'Kepolisian Resor Tasikmalaya' },
      { code: 'P.R. Ciamis', name: 'Kepolisian Resor Ciamis' },
      { code: 'P.R. Pangandaran', name: 'Kepolisian Resor Pangandaran' }
    ]
  },
  {
    code: 'P.D. Jawa Tengah',
    name: 'Kepolisian Daerah Jawa Tengah',
    polres: [
      { code: 'P.R. Semarang', name: 'Kepolisian Resor Semarang' },
      { code: 'P.R. Salatiga', name: 'Kepolisian Resor Salatiga' },
      { code: 'P.R. Kendal', name: 'Kepolisian Resor Kendal' },
      { code: 'P.R. Demak', name: 'Kepolisian Resor Demak' },
      { code: 'P.R. Grobogan', name: 'Kepolisian Resor Grobogan' },
      { code: 'P.R. Blora', name: 'Kepolisian Resor Blora' },
      { code: 'P.R. Rembang', name: 'Kepolisian Resor Rembang' },
      { code: 'P.R. Pati', name: 'Kepolisian Resor Pati' },
      { code: 'P.R. Kudus', name: 'Kepolisian Resor Kudus' },
      { code: 'P.R. Jepara', name: 'Kepolisian Resor Jepara' },
      { code: 'P.R. Purwodadi', name: 'Kepolisian Resor Purwodadi' },
      { code: 'P.R. Wonogiri', name: 'Kepolisian Resor Wonogiri' },
      { code: 'P.R. Sukoharjo', name: 'Kepolisian Resor Sukoharjo' },
      { code: 'P.R. Karanganyar', name: 'Kepolisian Resor Karanganyar' },
      { code: 'P.R. Sragen', name: 'Kepolisian Resor Sragen' },
      { code: 'P.R. Boyolali', name: 'Kepolisian Resor Boyolali' },
      { code: 'P.R. Klaten', name: 'Kepolisian Resor Klaten' },
      { code: 'P.R. Magelang', name: 'Kepolisian Resor Magelang' },
      { code: 'P.R. Temanggung', name: 'Kepolisian Resor Temanggung' },
      { code: 'P.R. Wonosobo', name: 'Kepolisian Resor Wonosobo' },
      { code: 'P.R. Purworejo', name: 'Kepolisian Resor Purworejo' },
      { code: 'P.R. Kebumen', name: 'Kepolisian Resor Kebumen' },
      { code: 'P.R. Banjarnegara', name: 'Kepolisian Resor Banjarnegara' },
      { code: 'P.R. Purbalingga', name: 'Kepolisian Resor Purbalingga' },
      { code: 'P.R. Banyumas', name: 'Kepolisian Resor Banyumas' },
      { code: 'P.R. Cilacap', name: 'Kepolisian Resor Cilacap' },
      { code: 'P.R. Brebes', name: 'Kepolisian Resor Brebes' },
      { code: 'P.R. Tegal', name: 'Kepolisian Resor Tegal' },
      { code: 'P.R. Pemalang', name: 'Kepolisian Resor Pemalang' },
      { code: 'P.R. Pekalongan', name: 'Kepolisian Resor Pekalongan' },
      { code: 'P.R. Batang', name: 'Kepolisian Resor Batang' }
    ]
  },
  {
    code: 'P.D. Jawa Timur',
    name: 'Kepolisian Daerah Jawa Timur',
    polres: [
      { code: 'P.R. Surabaya', name: 'Kepolisian Resor Surabaya' },
      { code: 'P.R. Gresik', name: 'Kepolisian Resor Gresik' },
      { code: 'P.R. Sidoarjo', name: 'Kepolisian Resor Sidoarjo' },
      { code: 'P.R. Mojokerto', name: 'Kepolisian Resor Mojokerto' },
      { code: 'P.R. Jombang', name: 'Kepolisian Resor Jombang' },
      { code: 'P.R. Nganjuk', name: 'Kepolisian Resor Nganjuk' },
      { code: 'P.R. Madiun', name: 'Kepolisian Resor Madiun' },
      { code: 'P.R. Magetan', name: 'Kepolisian Resor Magetan' },
      { code: 'P.R. Ngawi', name: 'Kepolisian Resor Ngawi' },
      { code: 'P.R. Bojonegoro', name: 'Kepolisian Resor Bojonegoro' },
      { code: 'P.R. Tuban', name: 'Kepolisian Resor Tuban' },
      { code: 'P.R. Lamongan', name: 'Kepolisian Resor Lamongan' },
      { code: 'P.R. Malang', name: 'Kepolisian Resor Malang' },
      { code: 'P.R. Batu', name: 'Kepolisian Resor Batu' },
      { code: 'P.R. Pasuruan', name: 'Kepolisian Resor Pasuruan' },
      { code: 'P.R. Probolinggo', name: 'Kepolisian Resor Probolinggo' },
      { code: 'P.R. Lumajang', name: 'Kepolisian Resor Lumajang' },
      { code: 'P.R. Jember', name: 'Kepolisian Resor Jember' },
      { code: 'P.R. Bondowoso', name: 'Kepolisian Resor Bondowoso' },
      { code: 'P.R. Situbondo', name: 'Kepolisian Resor Situbondo' },
      { code: 'P.R. Banyuwangi', name: 'Kepolisian Resor Banyuwangi' },
      { code: 'P.R. Kediri', name: 'Kepolisian Resor Kediri' },
      { code: 'P.R. Blitar', name: 'Kepolisian Resor Blitar' },
      { code: 'P.R. Tulungagung', name: 'Kepolisian Resor Tulungagung' },
      { code: 'P.R. Trenggalek', name: 'Kepolisian Resor Trenggalek' },
      { code: 'P.R. Ponorogo', name: 'Kepolisian Resor Ponorogo' },
      { code: 'P.R. Pacitan', name: 'Kepolisian Resor Pacitan' },
      { code: 'P.R. Bangkalan', name: 'Kepolisian Resor Bangkalan' },
      { code: 'P.R. Sampang', name: 'Kepolisian Resor Sampang' },
      { code: 'P.R. Pamekasan', name: 'Kepolisian Resor Pamekasan' },
      { code: 'P.R. Sumenep', name: 'Kepolisian Resor Sumenep' }
    ]
  },
  {
    code: 'P.D. Papua',
    name: 'Kepolisian Daerah Papua',
    polres: [
      { code: 'P.R. Jayapura', name: 'Kepolisian Resor Jayapura' },
      { code: 'P.R. Keerom', name: 'Kepolisian Resor Keerom' },
      { code: 'P.R. Sarmi', name: 'Kepolisian Resor Sarmi' },
      { code: 'P.R. Mamberamo Raya', name: 'Kepolisian Resor Mamberamo Raya' },
      { code: 'P.R. Yapen Waropen', name: 'Kepolisian Resor Yapen Waropen' },
      { code: 'P.R. Biak Numfor', name: 'Kepolisian Resor Biak Numfor' },
      { code: 'P.R. Supiori', name: 'Kepolisian Resor Supiori' },
      { code: 'P.R. Waropen', name: 'Kepolisian Resor Waropen' },
      { code: 'P.R. Nabire', name: 'Kepolisian Resor Nabire' },
      { code: 'P.R. Dogiyai', name: 'Kepolisian Resor Dogiyai' },
      { code: 'P.R. Deiyai', name: 'Kepolisian Resor Deiyai' },
      { code: 'P.R. Intan Jaya', name: 'Kepolisian Resor Intan Jaya' },
      { code: 'P.R. Paniai', name: 'Kepolisian Resor Paniai' },
      { code: 'P.R. Mimika', name: 'Kepolisian Resor Mimika' },
      { code: 'P.R. Puncak', name: 'Kepolisian Resor Puncak' },
      { code: 'P.R. Puncak Jaya', name: 'Kepolisian Resor Puncak Jaya' },
      { code: 'P.R. Lanny Jaya', name: 'Kepolisian Resor Lanny Jaya' },
      { code: 'P.R. Nduga', name: 'Kepolisian Resor Nduga' },
      { code: 'P.R. Jayawijaya', name: 'Kepolisian Resor Jayawijaya' },
      { code: 'P.R. Tolikara', name: 'Kepolisian Resor Tolikara' },
      { code: 'P.R. Yahukimo', name: 'Kepolisian Resor Yahukimo' },
      { code: 'P.R. Pegunungan Bintang', name: 'Kepolisian Resor Pegunungan Bintang' },
      { code: 'P.R. Boven Digoel', name: 'Kepolisian Resor Boven Digoel' },
      { code: 'P.R. Mappi', name: 'Kepolisian Resor Mappi' },
      { code: 'P.R. Asmat', name: 'Kepolisian Resor Asmat' },
      { code: 'P.R. Merauke', name: 'Kepolisian Resor Merauke' }
    ]
  },
  {
    code: 'P.D. Papua Barat',
    name: 'Kepolisian Daerah Papua Barat',
    polres: [
      { code: 'P.R. Sorong', name: 'Kepolisian Resor Sorong' },
      { code: 'P.R. Sorong Selatan', name: 'Kepolisian Resor Sorong Selatan' },
      { code: 'P.R. Raja Ampat', name: 'Kepolisian Resor Raja Ampat' },
      { code: 'P.R. Tambrauw', name: 'Kepolisian Resor Tambrauw' },
      { code: 'P.R. Maybrat', name: 'Kepolisian Resor Maybrat' },
      { code: 'P.R. Manokwari', name: 'Kepolisian Resor Manokwari' },
      { code: 'P.R. Manokwari Selatan', name: 'Kepolisian Resor Manokwari Selatan' },
      { code: 'P.R. Pegunungan Arfak', name: 'Kepolisian Resor Pegunungan Arfak' },
      { code: 'P.R. Teluk Bintuni', name: 'Kepolisian Resor Teluk Bintuni' },
      { code: 'P.R. Teluk Wondama', name: 'Kepolisian Resor Teluk Wondama' },
      { code: 'P.R. Kaimana', name: 'Kepolisian Resor Kaimana' },
      { code: 'P.R. Fakfak', name: 'Kepolisian Resor Fakfak' }
    ]
  }
]

async function seedPoldaPolres() {
  try {
    console.log('🌱 Memulai seeding data Polda dan Polres...')

    // Clear existing data
    console.log('🗑️  Menghapus data lama...')
    await prisma.polres.deleteMany()
    await prisma.polda.deleteMany()

    // Insert Polda and Polres data
    for (const polda of poldaData) {
      console.log(`📝 Membuat Polda: ${polda.name}`)
      
      const createdPolda = await prisma.polda.create({
        data: {
          name: polda.name,
          address: `Alamat ${polda.name}`,
          phone: '021-12345678'
        }
      })

      console.log(`   ✅ Polda ${polda.name} berhasil dibuat dengan ID: ${createdPolda.id}`)

      // Insert Polres for this Polda
      for (const polres of polda.polres) {
        console.log(`   📝 Membuat Polres: ${polres.name}`)
        
        await prisma.polres.create({
          data: {
            name: polres.name,
            address: `Alamat ${polres.name}`,
            phone: '021-87654321',
            poldaId: createdPolda.id
          }
        })

        console.log(`   ✅ Polres ${polres.name} berhasil dibuat`)
      }
    }

    console.log('🎉 Seeding data Polda dan Polres selesai!')
    
    // Show summary
    const poldaCount = await prisma.polda.count()
    const polresCount = await prisma.polres.count()
    
    console.log(`📊 Summary:`)
    console.log(`   - Total Polda: ${poldaCount}`)
    console.log(`   - Total Polres: ${polresCount}`)

  } catch (error) {
    console.error('❌ Error saat seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
seedPoldaPolres()
  .catch((error) => {
    console.error('❌ Seeding gagal:', error)
    process.exit(1)
  })
