const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  try {
    const poldaCount = await prisma.polda.count();
    const polresCount = await prisma.polres.count();
    
    console.log('📊 Database Summary:');
    console.log('   - Polda:', poldaCount);
    console.log('   - Polres:', polresCount);
    
    // Show some sample data
    console.log('\n🏛️ Sample Polda:');
    const samplePolda = await prisma.polda.findMany({ take: 5 });
    samplePolda.forEach(polda => {
      console.log(`   - ${polda.name} (${polda.phone})`);
    });
    
    console.log('\n🏢 Sample Polres:');
    const samplePolres = await prisma.polres.findMany({ 
      take: 5,
      include: { polda: true }
    });
    samplePolres.forEach(polres => {
      console.log(`   - ${polres.name} (${polres.polda.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
