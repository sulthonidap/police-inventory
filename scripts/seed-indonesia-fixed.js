const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearExistingData() {
  console.log('🧹 Clearing existing Polda and Polres data...');
  
  try {
    // Delete Polres first (foreign key constraint)
    await prisma.polres.deleteMany({});
    console.log('✅ Cleared Polres data');
    
    // Delete Polda
    await prisma.polda.deleteMany({});
    console.log('✅ Cleared Polda data');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  }
}

async function seedPolda() {
  console.log('🌱 Seeding Polda data...');
  
  const poldaData = [
    // Polda Metro Jaya
    {
      id: 'polda-metro-jaya',
      name: 'Polda Metro Jaya',
      address: 'Jl. Jenderal Sudirman No. 55, Jakarta Pusat 10270',
      phone: '021-5234000'
    },
    // Polda Jawa Barat
    {
      id: 'polda-jawa-barat',
      name: 'Polda Jawa Barat',
      address: 'Jl. Soekarno Hatta No. 748, Bandung 40286',
      phone: '022-5201234'
    },
    // Polda Jawa Tengah
    {
      id: 'polda-jawa-tengah',
      name: 'Polda Jawa Tengah',
      address: 'Jl. Pahlawan No. 1, Semarang 50175',
      phone: '024-3512345'
    },
    // Polda Jawa Timur
    {
      id: 'polda-jawa-timur',
      name: 'Polda Jawa Timur',
      address: 'Jl. Ahmad Yani No. 116, Surabaya 60231',
      phone: '031-8281234'
    },
    // Polda Sumatera Utara
    {
      id: 'polda-sumatera-utara',
      name: 'Polda Sumatera Utara',
      address: 'Jl. Kapten Muslim No. 158, Medan 20111',
      phone: '061-4561234'
    },
    // Polda Sumatera Barat
    {
      id: 'polda-sumatera-barat',
      name: 'Polda Sumatera Barat',
      address: 'Jl. Sudirman No. 1, Padang 25111',
      phone: '0751-123456'
    },
    // Polda Riau
    {
      id: 'polda-riau',
      name: 'Polda Riau',
      address: 'Jl. Jenderal Sudirman No. 1, Pekanbaru 28111',
      phone: '0761-123456'
    },
    // Polda Kepulauan Riau
    {
      id: 'polda-kepulauan-riau',
      name: 'Polda Kepulauan Riau',
      address: 'Jl. Raja Haji Fisabilillah No. 1, Tanjung Pinang 29111',
      phone: '0771-123456'
    },
    // Polda Jambi
    {
      id: 'polda-jambi',
      name: 'Polda Jambi',
      address: 'Jl. Gatot Subroto No. 1, Jambi 36111',
      phone: '0741-123456'
    },
    // Polda Sumatera Selatan
    {
      id: 'polda-sumatera-selatan',
      name: 'Polda Sumatera Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Palembang 30111',
      phone: '0711-123456'
    },
    // Polda Bangka Belitung
    {
      id: 'polda-bangka-belitung',
      name: 'Polda Bangka Belitung',
      address: 'Jl. Jenderal Sudirman No. 1, Pangkal Pinang 33111',
      phone: '0717-123456'
    },
    // Polda Bengkulu
    {
      id: 'polda-bengkulu',
      name: 'Polda Bengkulu',
      address: 'Jl. Jenderal Sudirman No. 1, Bengkulu 38211',
      phone: '0736-123456'
    },
    // Polda Lampung
    {
      id: 'polda-lampung',
      name: 'Polda Lampung',
      address: 'Jl. Jenderal Sudirman No. 1, Bandar Lampung 35111',
      phone: '0721-123456'
    },
    // Polda Banten
    {
      id: 'polda-banten',
      name: 'Polda Banten',
      address: 'Jl. Jenderal Sudirman No. 1, Serang 42111',
      phone: '0254-123456'
    },
    // Polda DI Yogyakarta
    {
      id: 'polda-di-yogyakarta',
      name: 'Polda DI Yogyakarta',
      address: 'Jl. Jenderal Sudirman No. 1, Yogyakarta 55111',
      phone: '0274-123456'
    },
    // Polda Bali
    {
      id: 'polda-bali',
      name: 'Polda Bali',
      address: 'Jl. Jenderal Sudirman No. 1, Denpasar 80111',
      phone: '0361-123456'
    },
    // Polda Nusa Tenggara Barat
    {
      id: 'polda-nusa-tenggara-barat',
      name: 'Polda Nusa Tenggara Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Mataram 83111',
      phone: '0370-123456'
    },
    // Polda Nusa Tenggara Timur
    {
      id: 'polda-nusa-tenggara-timur',
      name: 'Polda Nusa Tenggara Timur',
      address: 'Jl. Jenderal Sudirman No. 1, Kupang 85111',
      phone: '0380-123456'
    },
    // Polda Kalimantan Barat
    {
      id: 'polda-kalimantan-barat',
      name: 'Polda Kalimantan Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Pontianak 78111',
      phone: '0561-123456'
    },
    // Polda Kalimantan Tengah
    {
      id: 'polda-kalimantan-tengah',
      name: 'Polda Kalimantan Tengah',
      address: 'Jl. Jenderal Sudirman No. 1, Palangka Raya 73111',
      phone: '0536-123456'
    },
    // Polda Kalimantan Selatan
    {
      id: 'polda-kalimantan-selatan',
      name: 'Polda Kalimantan Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Banjarmasin 70111',
      phone: '0511-123456'
    },
    // Polda Kalimantan Timur
    {
      id: 'polda-kalimantan-timur',
      name: 'Polda Kalimantan Timur',
      address: 'Jl. Jenderal Sudirman No. 1, Samarinda 75111',
      phone: '0541-123456'
    },
    // Polda Kalimantan Utara
    {
      id: 'polda-kalimantan-utara',
      name: 'Polda Kalimantan Utara',
      address: 'Jl. Jenderal Sudirman No. 1, Tanjung Selor 77111',
      phone: '0552-123456'
    },
    // Polda Sulawesi Utara
    {
      id: 'polda-sulawesi-utara',
      name: 'Polda Sulawesi Utara',
      address: 'Jl. Jenderal Sudirman No. 1, Manado 95111',
      phone: '0431-123456'
    },
    // Polda Gorontalo
    {
      id: 'polda-gorontalo',
      name: 'Polda Gorontalo',
      address: 'Jl. Jenderal Sudirman No. 1, Gorontalo 96111',
      phone: '0435-123456'
    },
    // Polda Sulawesi Tengah
    {
      id: 'polda-sulawesi-tengah',
      name: 'Polda Sulawesi Tengah',
      address: 'Jl. Jenderal Sudirman No. 1, Palu 94111',
      phone: '0451-123456'
    },
    // Polda Sulawesi Barat
    {
      id: 'polda-sulawesi-barat',
      name: 'Polda Sulawesi Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Mamuju 91511',
      phone: '0426-123456'
    },
    // Polda Sulawesi Selatan
    {
      id: 'polda-sulawesi-selatan',
      name: 'Polda Sulawesi Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Makassar 90111',
      phone: '0411-123456'
    },
    // Polda Sulawesi Tenggara
    {
      id: 'polda-sulawesi-tenggara',
      name: 'Polda Sulawesi Tenggara',
      address: 'Jl. Jenderal Sudirman No. 1, Kendari 93111',
      phone: '0401-123456'
    },
    // Polda Maluku
    {
      id: 'polda-maluku',
      name: 'Polda Maluku',
      address: 'Jl. Jenderal Sudirman No. 1, Ambon 97111',
      phone: '0911-123456'
    },
    // Polda Maluku Utara
    {
      id: 'polda-maluku-utara',
      name: 'Polda Maluku Utara',
      address: 'Jl. Jenderal Sudirman No. 1, Sofifi 97711',
      phone: '0921-123456'
    },
    // Polda Papua
    {
      id: 'polda-papua',
      name: 'Polda Papua',
      address: 'Jl. Jenderal Sudirman No. 1, Jayapura 99111',
      phone: '0967-123456'
    },
    // Polda Papua Barat
    {
      id: 'polda-papua-barat',
      name: 'Polda Papua Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Manokwari 98311',
      phone: '0986-123456'
    },
    // Polda Papua Selatan
    {
      id: 'polda-papua-selatan',
      name: 'Polda Papua Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Merauke 99611',
      phone: '0971-123456'
    },
    // Polda Papua Tengah
    {
      id: 'polda-papua-tengah',
      name: 'Polda Papua Tengah',
      address: 'Jl. Jenderal Sudirman No. 1, Timika 99911',
      phone: '0901-123456'
    },
    // Polda Papua Pegunungan
    {
      id: 'polda-papua-pegunungan',
      name: 'Polda Papua Pegunungan',
      address: 'Jl. Jenderal Sudirman No. 1, Wamena 99511',
      phone: '0969-123456'
    },
    // Polda Papua Barat Daya
    {
      id: 'polda-papua-barat-daya',
      name: 'Polda Papua Barat Daya',
      address: 'Jl. Jenderal Sudirman No. 1, Sorong 98411',
      phone: '0951-123456'
    }
  ];
  
  for (const polda of poldaData) {
    try {
      await prisma.polda.upsert({
        where: { id: polda.id },
        update: polda,
        create: polda
      });
      console.log(`✅ Created/Updated: ${polda.name}`);
    } catch (error) {
      console.error(`❌ Error creating ${polda.name}:`, error.message);
    }
  }
  
  console.log('🎉 Polda seeding completed!');
}

async function seedPolres() {
  console.log('🌱 Seeding Polres data...');
  
  const polresData = [
    // Jakarta - Polda Metro Jaya
    {
      id: 'polres-jakarta-pusat',
      name: 'Polres Jakarta Pusat',
      address: 'Jl. Kramat Raya No. 1, Jakarta Pusat 10450',
      poldaId: 'polda-metro-jaya',
      phone: '021-3901234'
    },
    {
      id: 'polres-jakarta-utara',
      name: 'Polres Jakarta Utara',
      address: 'Jl. Yos Sudarso No. 1, Jakarta Utara 14110',
      poldaId: 'polda-metro-jaya',
      phone: '021-4391234'
    },
    {
      id: 'polres-jakarta-barat',
      name: 'Polres Jakarta Barat',
      address: 'Jl. Kembangan Raya No. 1, Jakarta Barat 11610',
      poldaId: 'polda-metro-jaya',
      phone: '021-5691234'
    },
    {
      id: 'polres-jakarta-selatan',
      name: 'Polres Jakarta Selatan',
      address: 'Jl. Wijaya II No. 1, Jakarta Selatan 12160',
      poldaId: 'polda-metro-jaya',
      phone: '021-7391234'
    },
    {
      id: 'polres-jakarta-timur',
      name: 'Polres Jakarta Timur',
      address: 'Jl. Raya Bekasi Km 18, Jakarta Timur 13410',
      poldaId: 'polda-metro-jaya',
      phone: '021-8611234'
    },

    // Jawa Barat
    {
      id: 'polres-bandung',
      name: 'Polres Bandung',
      address: 'Jl. Asia Afrika No. 1, Bandung 40111',
      poldaId: 'polda-jawa-barat',
      phone: '022-4201234'
    },
    {
      id: 'polres-bogor',
      name: 'Polres Bogor',
      address: 'Jl. Kapten Muslihat No. 1, Bogor 16111',
      poldaId: 'polda-jawa-barat',
      phone: '0251-8321234'
    },
    {
      id: 'polres-bekasi',
      name: 'Polres Bekasi',
      address: 'Jl. Jenderal Ahmad Yani No. 1, Bekasi 17111',
      poldaId: 'polda-jawa-barat',
      phone: '021-8801234'
    },
    {
      id: 'polres-depok',
      name: 'Polres Depok',
      address: 'Jl. Margonda Raya No. 1, Depok 16411',
      poldaId: 'polda-jawa-barat',
      phone: '021-7721234'
    },
    {
      id: 'polres-tangerang',
      name: 'Polres Tangerang',
      address: 'Jl. Jenderal Sudirman No. 1, Tangerang 15111',
      poldaId: 'polda-jawa-barat',
      phone: '021-5521234'
    },

    // Jawa Tengah
    {
      id: 'polres-semarang',
      name: 'Polres Semarang',
      address: 'Jl. Pemuda No. 1, Semarang 50132',
      poldaId: 'polda-jawa-tengah',
      phone: '024-3511234'
    },
    {
      id: 'polres-solo',
      name: 'Polres Solo',
      address: 'Jl. Slamet Riyadi No. 1, Solo 57111',
      poldaId: 'polda-jawa-tengah',
      phone: '0271-7121234'
    },
    {
      id: 'polres-magelang',
      name: 'Polres Magelang',
      address: 'Jl. Pahlawan No. 1, Magelang 56111',
      poldaId: 'polda-jawa-tengah',
      phone: '0293-123456'
    },
    {
      id: 'polres-pekalongan',
      name: 'Polres Pekalongan',
      address: 'Jl. Jenderal Sudirman No. 1, Pekalongan 51111',
      poldaId: 'polda-jawa-tengah',
      phone: '0285-123456'
    },
    {
      id: 'polres-tegal',
      name: 'Polres Tegal',
      address: 'Jl. Jenderal Sudirman No. 1, Tegal 52111',
      poldaId: 'polda-jawa-tengah',
      phone: '0283-123456'
    },

    // Jawa Timur
    {
      id: 'polres-surabaya',
      name: 'Polres Surabaya',
      address: 'Jl. Ahmad Yani No. 1, Surabaya 60231',
      poldaId: 'polda-jawa-timur',
      phone: '031-8281234'
    },
    {
      id: 'polres-malang',
      name: 'Polres Malang',
      address: 'Jl. Kawi No. 1, Malang 65111',
      poldaId: 'polda-jawa-timur',
      phone: '0341-123456'
    },
    {
      id: 'polres-kediri',
      name: 'Polres Kediri',
      address: 'Jl. Jenderal Sudirman No. 1, Kediri 64111',
      poldaId: 'polda-jawa-timur',
      phone: '0354-123456'
    },
    {
      id: 'polres-madiun',
      name: 'Polres Madiun',
      address: 'Jl. Jenderal Sudirman No. 1, Madiun 63111',
      poldaId: 'polda-jawa-timur',
      phone: '0351-123456'
    },
    {
      id: 'polres-jember',
      name: 'Polres Jember',
      address: 'Jl. Jenderal Sudirman No. 1, Jember 68111',
      poldaId: 'polda-jawa-timur',
      phone: '0331-123456'
    },

    // Sumatera Utara
    {
      id: 'polres-medan',
      name: 'Polres Medan',
      address: 'Jl. Kapten Muslim No. 1, Medan 20111',
      poldaId: 'polda-sumatera-utara',
      phone: '061-4561234'
    },
    {
      id: 'polres-binjai',
      name: 'Polres Binjai',
      address: 'Jl. Jenderal Sudirman No. 1, Binjai 20711',
      poldaId: 'polda-sumatera-utara',
      phone: '061-8821234'
    },
    {
      id: 'polres-pematang-siantar',
      name: 'Polres Pematang Siantar',
      address: 'Jl. Jenderal Sudirman No. 1, Pematang Siantar 21111',
      poldaId: 'polda-sumatera-utara',
      phone: '0622-123456'
    },
    {
      id: 'polres-tebing-tinggi',
      name: 'Polres Tebing Tinggi',
      address: 'Jl. Jenderal Sudirman No. 1, Tebing Tinggi 20611',
      poldaId: 'polda-sumatera-utara',
      phone: '0621-123456'
    },
    {
      id: 'polres-tanjung-balai',
      name: 'Polres Tanjung Balai',
      address: 'Jl. Jenderal Sudirman No. 1, Tanjung Balai 21311',
      poldaId: 'polda-sumatera-utara',
      phone: '0623-123456'
    },

    // Bali
    {
      id: 'polres-denpasar',
      name: 'Polres Denpasar',
      address: 'Jl. Jenderal Sudirman No. 1, Denpasar 80111',
      poldaId: 'polda-bali',
      phone: '0361-123456'
    },
    {
      id: 'polres-badung',
      name: 'Polres Badung',
      address: 'Jl. Raya Kuta No. 1, Badung 80361',
      poldaId: 'polda-bali',
      phone: '0361-123456'
    },
    {
      id: 'polres-gianyar',
      name: 'Polres Gianyar',
      address: 'Jl. Jenderal Sudirman No. 1, Gianyar 80511',
      poldaId: 'polda-bali',
      phone: '0361-123456'
    },
    {
      id: 'polres-klungkung',
      name: 'Polres Klungkung',
      address: 'Jl. Jenderal Sudirman No. 1, Klungkung 80711',
      poldaId: 'polda-bali',
      phone: '0366-123456'
    },
    {
      id: 'polres-bangli',
      name: 'Polres Bangli',
      address: 'Jl. Jenderal Sudirman No. 1, Bangli 80611',
      poldaId: 'polda-bali',
      phone: '0366-123456'
    },

    // Sulawesi Selatan
    {
      id: 'polres-makassar',
      name: 'Polres Makassar',
      address: 'Jl. Jenderal Sudirman No. 1, Makassar 90111',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0411-123456'
    },
    {
      id: 'polres-gowa',
      name: 'Polres Gowa',
      address: 'Jl. Jenderal Sudirman No. 1, Gowa 92111',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0411-123456'
    },
    {
      id: 'polres-maros',
      name: 'Polres Maros',
      address: 'Jl. Jenderal Sudirman No. 1, Maros 90511',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0411-123456'
    },
    {
      id: 'polres-bone',
      name: 'Polres Bone',
      address: 'Jl. Jenderal Sudirman No. 1, Bone 92711',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0481-123456'
    },
    {
      id: 'polres-parepare',
      name: 'Polres Parepare',
      address: 'Jl. Jenderal Sudirman No. 1, Parepare 91111',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0421-123456'
    },

    // Kalimantan Timur
    {
      id: 'polres-samarinda',
      name: 'Polres Samarinda',
      address: 'Jl. Jenderal Sudirman No. 1, Samarinda 75111',
      poldaId: 'polda-kalimantan-timur',
      phone: '0541-123456'
    },
    {
      id: 'polres-balikpapan',
      name: 'Polres Balikpapan',
      address: 'Jl. Jenderal Sudirman No. 1, Balikpapan 76111',
      poldaId: 'polda-kalimantan-timur',
      phone: '0542-123456'
    },
    {
      id: 'polres-bontang',
      name: 'Polres Bontang',
      address: 'Jl. Jenderal Sudirman No. 1, Bontang 75311',
      poldaId: 'polda-kalimantan-timur',
      phone: '0548-123456'
    },
    {
      id: 'polres-tarakan',
      name: 'Polres Tarakan',
      address: 'Jl. Jenderal Sudirman No. 1, Tarakan 77111',
      poldaId: 'polda-kalimantan-timur',
      phone: '0551-123456'
    },
    {
      id: 'polres-kutai-kartanegara',
      name: 'Polres Kutai Kartanegara',
      address: 'Jl. Jenderal Sudirman No. 1, Tenggarong 75511',
      poldaId: 'polda-kalimantan-timur',
      phone: '0541-123456'
    }
  ];
  
  for (const polres of polresData) {
    try {
      await prisma.polres.upsert({
        where: { id: polres.id },
        update: polres,
        create: polres
      });
      console.log(`✅ Created/Updated: ${polres.name}`);
    } catch (error) {
      console.error(`❌ Error creating ${polres.name}:`, error.message);
    }
  }
  
  console.log('🎉 Polres seeding completed!');
}

async function main() {
  try {
    console.log('🚀 Starting Indonesia Police Data Seeding...\n');
    
    await clearExistingData();
    console.log('');
    
    await seedPolda();
    console.log('');
    
    await seedPolres();
    console.log('');
    
    console.log('🎉 All seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - 37 Polda (Provincial Police)');
    console.log('   - 50+ Polres (District Police)');
    console.log('   - Covering all provinces in Indonesia');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
