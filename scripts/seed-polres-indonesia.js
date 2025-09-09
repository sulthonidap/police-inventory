const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

async function seedPolres() {
  console.log('🌱 Seeding Polres data...');
  
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
    await seedPolres();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
