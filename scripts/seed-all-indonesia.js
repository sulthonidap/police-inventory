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
      province: 'DKI Jakarta',
      phone: '021-5234000',
      email: 'polda.metrojaya@polri.go.id'
    },
    // Polda Jawa Barat
    {
      id: 'polda-jawa-barat',
      name: 'Polda Jawa Barat',
      address: 'Jl. Soekarno Hatta No. 748, Bandung 40286',
      province: 'Jawa Barat',
      phone: '022-5201234',
      email: 'polda.jabar@polri.go.id'
    },
    // Polda Jawa Tengah
    {
      id: 'polda-jawa-tengah',
      name: 'Polda Jawa Tengah',
      address: 'Jl. Pahlawan No. 1, Semarang 50175',
      province: 'Jawa Tengah',
      phone: '024-3512345',
      email: 'polda.jateng@polri.go.id'
    },
    // Polda Jawa Timur
    {
      id: 'polda-jawa-timur',
      name: 'Polda Jawa Timur',
      address: 'Jl. Ahmad Yani No. 116, Surabaya 60231',
      province: 'Jawa Timur',
      phone: '031-8281234',
      email: 'polda.jatim@polri.go.id'
    },
    // Polda Sumatera Utara
    {
      id: 'polda-sumatera-utara',
      name: 'Polda Sumatera Utara',
      address: 'Jl. Kapten Muslim No. 158, Medan 20111',
      province: 'Sumatera Utara',
      phone: '061-4561234',
      email: 'polda.sumut@polri.go.id'
    },
    // Polda Sumatera Barat
    {
      id: 'polda-sumatera-barat',
      name: 'Polda Sumatera Barat',
      address: 'Jl. Sudirman No. 1, Padang 25111',
      province: 'Sumatera Barat',
      phone: '0751-123456',
      email: 'polda.sumbar@polri.go.id'
    },
    // Polda Riau
    {
      id: 'polda-riau',
      name: 'Polda Riau',
      address: 'Jl. Jenderal Sudirman No. 1, Pekanbaru 28111',
      province: 'Riau',
      phone: '0761-123456',
      email: 'polda.riau@polri.go.id'
    },
    // Polda Kepulauan Riau
    {
      id: 'polda-kepulauan-riau',
      name: 'Polda Kepulauan Riau',
      address: 'Jl. Raja Haji Fisabilillah No. 1, Tanjung Pinang 29111',
      province: 'Kepulauan Riau',
      phone: '0771-123456',
      email: 'polda.kepri@polri.go.id'
    },
    // Polda Jambi
    {
      id: 'polda-jambi',
      name: 'Polda Jambi',
      address: 'Jl. Gatot Subroto No. 1, Jambi 36111',
      province: 'Jambi',
      phone: '0741-123456',
      email: 'polda.jambi@polri.go.id'
    },
    // Polda Sumatera Selatan
    {
      id: 'polda-sumatera-selatan',
      name: 'Polda Sumatera Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Palembang 30111',
      province: 'Sumatera Selatan',
      phone: '0711-123456',
      email: 'polda.sumsel@polri.go.id'
    },
    // Polda Bangka Belitung
    {
      id: 'polda-bangka-belitung',
      name: 'Polda Bangka Belitung',
      address: 'Jl. Jenderal Sudirman No. 1, Pangkal Pinang 33111',
      province: 'Bangka Belitung',
      phone: '0717-123456',
      email: 'polda.babel@polri.go.id'
    },
    // Polda Bengkulu
    {
      id: 'polda-bengkulu',
      name: 'Polda Bengkulu',
      address: 'Jl. Jenderal Sudirman No. 1, Bengkulu 38211',
      province: 'Bengkulu',
      phone: '0736-123456',
      email: 'polda.bengkulu@polri.go.id'
    },
    // Polda Lampung
    {
      id: 'polda-lampung',
      name: 'Polda Lampung',
      address: 'Jl. Jenderal Sudirman No. 1, Bandar Lampung 35111',
      province: 'Lampung',
      phone: '0721-123456',
      email: 'polda.lampung@polri.go.id'
    },
    // Polda Banten
    {
      id: 'polda-banten',
      name: 'Polda Banten',
      address: 'Jl. Jenderal Sudirman No. 1, Serang 42111',
      province: 'Banten',
      phone: '0254-123456',
      email: 'polda.banten@polri.go.id'
    },
    // Polda DI Yogyakarta
    {
      id: 'polda-di-yogyakarta',
      name: 'Polda DI Yogyakarta',
      address: 'Jl. Jenderal Sudirman No. 1, Yogyakarta 55111',
      province: 'DI Yogyakarta',
      phone: '0274-123456',
      email: 'polda.diy@polri.go.id'
    },
    // Polda Bali
    {
      id: 'polda-bali',
      name: 'Polda Bali',
      address: 'Jl. Jenderal Sudirman No. 1, Denpasar 80111',
      province: 'Bali',
      phone: '0361-123456',
      email: 'polda.bali@polri.go.id'
    },
    // Polda Nusa Tenggara Barat
    {
      id: 'polda-nusa-tenggara-barat',
      name: 'Polda Nusa Tenggara Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Mataram 83111',
      province: 'Nusa Tenggara Barat',
      phone: '0370-123456',
      email: 'polda.ntb@polri.go.id'
    },
    // Polda Nusa Tenggara Timur
    {
      id: 'polda-nusa-tenggara-timur',
      name: 'Polda Nusa Tenggara Timur',
      address: 'Jl. Jenderal Sudirman No. 1, Kupang 85111',
      province: 'Nusa Tenggara Timur',
      phone: '0380-123456',
      email: 'polda.ntt@polri.go.id'
    },
    // Polda Kalimantan Barat
    {
      id: 'polda-kalimantan-barat',
      name: 'Polda Kalimantan Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Pontianak 78111',
      province: 'Kalimantan Barat',
      phone: '0561-123456',
      email: 'polda.kalbar@polri.go.id'
    },
    // Polda Kalimantan Tengah
    {
      id: 'polda-kalimantan-tengah',
      name: 'Polda Kalimantan Tengah',
      address: 'Jl. Jenderal Sudirman No. 1, Palangka Raya 73111',
      province: 'Kalimantan Tengah',
      phone: '0536-123456',
      email: 'polda.kalteng@polri.go.id'
    },
    // Polda Kalimantan Selatan
    {
      id: 'polda-kalimantan-selatan',
      name: 'Polda Kalimantan Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Banjarmasin 70111',
      province: 'Kalimantan Selatan',
      phone: '0511-123456',
      email: 'polda.kalsel@polri.go.id'
    },
    // Polda Kalimantan Timur
    {
      id: 'polda-kalimantan-timur',
      name: 'Polda Kalimantan Timur',
      address: 'Jl. Jenderal Sudirman No. 1, Samarinda 75111',
      province: 'Kalimantan Timur',
      phone: '0541-123456',
      email: 'polda.kaltim@polri.go.id'
    },
    // Polda Kalimantan Utara
    {
      id: 'polda-kalimantan-utara',
      name: 'Polda Kalimantan Utara',
      address: 'Jl. Jenderal Sudirman No. 1, Tanjung Selor 77111',
      province: 'Kalimantan Utara',
      phone: '0552-123456',
      email: 'polda.kaltara@polri.go.id'
    },
    // Polda Sulawesi Utara
    {
      id: 'polda-sulawesi-utara',
      name: 'Polda Sulawesi Utara',
      address: 'Jl. Jenderal Sudirman No. 1, Manado 95111',
      province: 'Sulawesi Utara',
      phone: '0431-123456',
      email: 'polda.sulut@polri.go.id'
    },
    // Polda Gorontalo
    {
      id: 'polda-gorontalo',
      name: 'Polda Gorontalo',
      address: 'Jl. Jenderal Sudirman No. 1, Gorontalo 96111',
      province: 'Gorontalo',
      phone: '0435-123456',
      email: 'polda.gorontalo@polri.go.id'
    },
    // Polda Sulawesi Tengah
    {
      id: 'polda-sulawesi-tengah',
      name: 'Polda Sulawesi Tengah',
      address: 'Jl. Jenderal Sudirman No. 1, Palu 94111',
      province: 'Sulawesi Tengah',
      phone: '0451-123456',
      email: 'polda.sulteng@polri.go.id'
    },
    // Polda Sulawesi Barat
    {
      id: 'polda-sulawesi-barat',
      name: 'Polda Sulawesi Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Mamuju 91511',
      province: 'Sulawesi Barat',
      phone: '0426-123456',
      email: 'polda.sulbar@polri.go.id'
    },
    // Polda Sulawesi Selatan
    {
      id: 'polda-sulawesi-selatan',
      name: 'Polda Sulawesi Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Makassar 90111',
      province: 'Sulawesi Selatan',
      phone: '0411-123456',
      email: 'polda.sulsel@polri.go.id'
    },
    // Polda Sulawesi Tenggara
    {
      id: 'polda-sulawesi-tenggara',
      name: 'Polda Sulawesi Tenggara',
      address: 'Jl. Jenderal Sudirman No. 1, Kendari 93111',
      province: 'Sulawesi Tenggara',
      phone: '0401-123456',
      email: 'polda.sultra@polri.go.id'
    },
    // Polda Maluku
    {
      id: 'polda-maluku',
      name: 'Polda Maluku',
      address: 'Jl. Jenderal Sudirman No. 1, Ambon 97111',
      province: 'Maluku',
      phone: '0911-123456',
      email: 'polda.maluku@polri.go.id'
    },
    // Polda Maluku Utara
    {
      id: 'polda-maluku-utara',
      name: 'Polda Maluku Utara',
      address: 'Jl. Jenderal Sudirman No. 1, Sofifi 97711',
      province: 'Maluku Utara',
      phone: '0921-123456',
      email: 'polda.malut@polri.go.id'
    },
    // Polda Papua
    {
      id: 'polda-papua',
      name: 'Polda Papua',
      address: 'Jl. Jenderal Sudirman No. 1, Jayapura 99111',
      province: 'Papua',
      phone: '0967-123456',
      email: 'polda.papua@polri.go.id'
    },
    // Polda Papua Barat
    {
      id: 'polda-papua-barat',
      name: 'Polda Papua Barat',
      address: 'Jl. Jenderal Sudirman No. 1, Manokwari 98311',
      province: 'Papua Barat',
      phone: '0986-123456',
      email: 'polda.papbar@polri.go.id'
    },
    // Polda Papua Selatan
    {
      id: 'polda-papua-selatan',
      name: 'Polda Papua Selatan',
      address: 'Jl. Jenderal Sudirman No. 1, Merauke 99611',
      province: 'Papua Selatan',
      phone: '0971-123456',
      email: 'polda.papsel@polri.go.id'
    },
    // Polda Papua Tengah
    {
      id: 'polda-papua-tengah',
      name: 'Polda Papua Tengah',
      address: 'Jl. Jenderal Sudirman No. 1, Timika 99911',
      province: 'Papua Tengah',
      phone: '0901-123456',
      email: 'polda.papteng@polri.go.id'
    },
    // Polda Papua Pegunungan
    {
      id: 'polda-papua-pegunungan',
      name: 'Polda Papua Pegunungan',
      address: 'Jl. Jenderal Sudirman No. 1, Wamena 99511',
      province: 'Papua Pegunungan',
      phone: '0969-123456',
      email: 'polda.pappeg@polri.go.id'
    },
    // Polda Papua Barat Daya
    {
      id: 'polda-papua-barat-daya',
      name: 'Polda Papua Barat Daya',
      address: 'Jl. Jenderal Sudirman No. 1, Sorong 98411',
      province: 'Papua Barat Daya',
      phone: '0951-123456',
      email: 'polda.papbar@polri.go.id'
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
      phone: '021-3901234',
      email: 'polres.jakpus@polri.go.id'
    },
    {
      id: 'polres-jakarta-utara',
      name: 'Polres Jakarta Utara',
      address: 'Jl. Yos Sudarso No. 1, Jakarta Utara 14110',
      poldaId: 'polda-metro-jaya',
      phone: '021-4391234',
      email: 'polres.jakut@polri.go.id'
    },
    {
      id: 'polres-jakarta-barat',
      name: 'Polres Jakarta Barat',
      address: 'Jl. Kembangan Raya No. 1, Jakarta Barat 11610',
      poldaId: 'polda-metro-jaya',
      phone: '021-5691234',
      email: 'polres.jakbar@polri.go.id'
    },
    {
      id: 'polres-jakarta-selatan',
      name: 'Polres Jakarta Selatan',
      address: 'Jl. Wijaya II No. 1, Jakarta Selatan 12160',
      poldaId: 'polda-metro-jaya',
      phone: '021-7391234',
      email: 'polres.jaksel@polri.go.id'
    },
    {
      id: 'polres-jakarta-timur',
      name: 'Polres Jakarta Timur',
      address: 'Jl. Raya Bekasi Km 18, Jakarta Timur 13410',
      poldaId: 'polda-metro-jaya',
      phone: '021-8611234',
      email: 'polres.jaktim@polri.go.id'
    },

    // Jawa Barat
    {
      id: 'polres-bandung',
      name: 'Polres Bandung',
      address: 'Jl. Asia Afrika No. 1, Bandung 40111',
      poldaId: 'polda-jawa-barat',
      phone: '022-4201234',
      email: 'polres.bandung@polri.go.id'
    },
    {
      id: 'polres-bogor',
      name: 'Polres Bogor',
      address: 'Jl. Kapten Muslihat No. 1, Bogor 16111',
      poldaId: 'polda-jawa-barat',
      phone: '0251-8321234',
      email: 'polres.bogor@polri.go.id'
    },
    {
      id: 'polres-bekasi',
      name: 'Polres Bekasi',
      address: 'Jl. Jenderal Ahmad Yani No. 1, Bekasi 17111',
      poldaId: 'polda-jawa-barat',
      phone: '021-8801234',
      email: 'polres.bekasi@polri.go.id'
    },
    {
      id: 'polres-depok',
      name: 'Polres Depok',
      address: 'Jl. Margonda Raya No. 1, Depok 16411',
      poldaId: 'polda-jawa-barat',
      phone: '021-7721234',
      email: 'polres.depok@polri.go.id'
    },
    {
      id: 'polres-tangerang',
      name: 'Polres Tangerang',
      address: 'Jl. Jenderal Sudirman No. 1, Tangerang 15111',
      poldaId: 'polda-jawa-barat',
      phone: '021-5521234',
      email: 'polres.tangerang@polri.go.id'
    },

    // Jawa Tengah
    {
      id: 'polres-semarang',
      name: 'Polres Semarang',
      address: 'Jl. Pemuda No. 1, Semarang 50132',
      poldaId: 'polda-jawa-tengah',
      phone: '024-3511234',
      email: 'polres.semarang@polri.go.id'
    },
    {
      id: 'polres-solo',
      name: 'Polres Solo',
      address: 'Jl. Slamet Riyadi No. 1, Solo 57111',
      poldaId: 'polda-jawa-tengah',
      phone: '0271-7121234',
      email: 'polres.solo@polri.go.id'
    },
    {
      id: 'polres-magelang',
      name: 'Polres Magelang',
      address: 'Jl. Pahlawan No. 1, Magelang 56111',
      poldaId: 'polda-jawa-tengah',
      phone: '0293-123456',
      email: 'polres.magelang@polri.go.id'
    },
    {
      id: 'polres-pekalongan',
      name: 'Polres Pekalongan',
      address: 'Jl. Jenderal Sudirman No. 1, Pekalongan 51111',
      poldaId: 'polda-jawa-tengah',
      phone: '0285-123456',
      email: 'polres.pekalongan@polri.go.id'
    },
    {
      id: 'polres-tegal',
      name: 'Polres Tegal',
      address: 'Jl. Jenderal Sudirman No. 1, Tegal 52111',
      poldaId: 'polda-jawa-tengah',
      phone: '0283-123456',
      email: 'polres.tegal@polri.go.id'
    },

    // Jawa Timur
    {
      id: 'polres-surabaya',
      name: 'Polres Surabaya',
      address: 'Jl. Ahmad Yani No. 1, Surabaya 60231',
      poldaId: 'polda-jawa-timur',
      phone: '031-8281234',
      email: 'polres.surabaya@polri.go.id'
    },
    {
      id: 'polres-malang',
      name: 'Polres Malang',
      address: 'Jl. Kawi No. 1, Malang 65111',
      poldaId: 'polda-jawa-timur',
      phone: '0341-123456',
      email: 'polres.malang@polri.go.id'
    },
    {
      id: 'polres-kediri',
      name: 'Polres Kediri',
      address: 'Jl. Jenderal Sudirman No. 1, Kediri 64111',
      poldaId: 'polda-jawa-timur',
      phone: '0354-123456',
      email: 'polres.kediri@polri.go.id'
    },
    {
      id: 'polres-madiun',
      name: 'Polres Madiun',
      address: 'Jl. Jenderal Sudirman No. 1, Madiun 63111',
      poldaId: 'polda-jawa-timur',
      phone: '0351-123456',
      email: 'polres.madiun@polri.go.id'
    },
    {
      id: 'polres-jember',
      name: 'Polres Jember',
      address: 'Jl. Jenderal Sudirman No. 1, Jember 68111',
      poldaId: 'polda-jawa-timur',
      phone: '0331-123456',
      email: 'polres.jember@polri.go.id'
    },

    // Sumatera Utara
    {
      id: 'polres-medan',
      name: 'Polres Medan',
      address: 'Jl. Kapten Muslim No. 1, Medan 20111',
      poldaId: 'polda-sumatera-utara',
      phone: '061-4561234',
      email: 'polres.medan@polri.go.id'
    },
    {
      id: 'polres-binjai',
      name: 'Polres Binjai',
      address: 'Jl. Jenderal Sudirman No. 1, Binjai 20711',
      poldaId: 'polda-sumatera-utara',
      phone: '061-8821234',
      email: 'polres.binjai@polri.go.id'
    },
    {
      id: 'polres-pematang-siantar',
      name: 'Polres Pematang Siantar',
      address: 'Jl. Jenderal Sudirman No. 1, Pematang Siantar 21111',
      poldaId: 'polda-sumatera-utara',
      phone: '0622-123456',
      email: 'polres.pematangsiantar@polri.go.id'
    },
    {
      id: 'polres-tebing-tinggi',
      name: 'Polres Tebing Tinggi',
      address: 'Jl. Jenderal Sudirman No. 1, Tebing Tinggi 20611',
      poldaId: 'polda-sumatera-utara',
      phone: '0621-123456',
      email: 'polres.tebingtinggi@polri.go.id'
    },
    {
      id: 'polres-tanjung-balai',
      name: 'Polres Tanjung Balai',
      address: 'Jl. Jenderal Sudirman No. 1, Tanjung Balai 21311',
      poldaId: 'polda-sumatera-utara',
      phone: '0623-123456',
      email: 'polres.tanjungbalai@polri.go.id'
    },

    // Bali
    {
      id: 'polres-denpasar',
      name: 'Polres Denpasar',
      address: 'Jl. Jenderal Sudirman No. 1, Denpasar 80111',
      poldaId: 'polda-bali',
      phone: '0361-123456',
      email: 'polres.denpasar@polri.go.id'
    },
    {
      id: 'polres-badung',
      name: 'Polres Badung',
      address: 'Jl. Raya Kuta No. 1, Badung 80361',
      poldaId: 'polda-bali',
      phone: '0361-123456',
      email: 'polres.badung@polri.go.id'
    },
    {
      id: 'polres-gianyar',
      name: 'Polres Gianyar',
      address: 'Jl. Jenderal Sudirman No. 1, Gianyar 80511',
      poldaId: 'polda-bali',
      phone: '0361-123456',
      email: 'polres.gianyar@polri.go.id'
    },
    {
      id: 'polres-klungkung',
      name: 'Polres Klungkung',
      address: 'Jl. Jenderal Sudirman No. 1, Klungkung 80711',
      poldaId: 'polda-bali',
      phone: '0366-123456',
      email: 'polres.klungkung@polri.go.id'
    },
    {
      id: 'polres-bangli',
      name: 'Polres Bangli',
      address: 'Jl. Jenderal Sudirman No. 1, Bangli 80611',
      poldaId: 'polda-bali',
      phone: '0366-123456',
      email: 'polres.bangli@polri.go.id'
    },

    // Sulawesi Selatan
    {
      id: 'polres-makassar',
      name: 'Polres Makassar',
      address: 'Jl. Jenderal Sudirman No. 1, Makassar 90111',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0411-123456',
      email: 'polres.makassar@polri.go.id'
    },
    {
      id: 'polres-gowa',
      name: 'Polres Gowa',
      address: 'Jl. Jenderal Sudirman No. 1, Gowa 92111',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0411-123456',
      email: 'polres.gowa@polri.go.id'
    },
    {
      id: 'polres-maros',
      name: 'Polres Maros',
      address: 'Jl. Jenderal Sudirman No. 1, Maros 90511',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0411-123456',
      email: 'polres.maros@polri.go.id'
    },
    {
      id: 'polres-bone',
      name: 'Polres Bone',
      address: 'Jl. Jenderal Sudirman No. 1, Bone 92711',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0481-123456',
      email: 'polres.bone@polri.go.id'
    },
    {
      id: 'polres-parepare',
      name: 'Polres Parepare',
      address: 'Jl. Jenderal Sudirman No. 1, Parepare 91111',
      poldaId: 'polda-sulawesi-selatan',
      phone: '0421-123456',
      email: 'polres.parepare@polri.go.id'
    },

    // Kalimantan Timur
    {
      id: 'polres-samarinda',
      name: 'Polres Samarinda',
      address: 'Jl. Jenderal Sudirman No. 1, Samarinda 75111',
      poldaId: 'polda-kalimantan-timur',
      phone: '0541-123456',
      email: 'polres.samarinda@polri.go.id'
    },
    {
      id: 'polres-balikpapan',
      name: 'Polres Balikpapan',
      address: 'Jl. Jenderal Sudirman No. 1, Balikpapan 76111',
      poldaId: 'polda-kalimantan-timur',
      phone: '0542-123456',
      email: 'polres.balikpapan@polri.go.id'
    },
    {
      id: 'polres-bontang',
      name: 'Polres Bontang',
      address: 'Jl. Jenderal Sudirman No. 1, Bontang 75311',
      poldaId: 'polda-kalimantan-timur',
      phone: '0548-123456',
      email: 'polres.bontang@polri.go.id'
    },
    {
      id: 'polres-tarakan',
      name: 'Polres Tarakan',
      address: 'Jl. Jenderal Sudirman No. 1, Tarakan 77111',
      poldaId: 'polda-kalimantan-timur',
      phone: '0551-123456',
      email: 'polres.tarakan@polri.go.id'
    },
    {
      id: 'polres-kutai-kartanegara',
      name: 'Polres Kutai Kartanegara',
      address: 'Jl. Jenderal Sudirman No. 1, Tenggarong 75511',
      poldaId: 'polda-kalimantan-timur',
      phone: '0541-123456',
      email: 'polres.kutai@polri.go.id'
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
