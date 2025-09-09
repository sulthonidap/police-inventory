const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHarwat() {
  try {
    console.log('🔍 Testing Harwat functionality...\n');
    
    // Check harwat count
    const harwatCount = await prisma.harwat.count();
    console.log('📊 Harwat count:', harwatCount);
    
    // Get sample harwat data
    const sampleHarwat = await prisma.harwat.findMany({ 
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📋 Sample Harwat data:');
    sampleHarwat.forEach((harwat, index) => {
      console.log(`${index + 1}. ${harwat.title}`);
      console.log(`   Date: ${harwat.dateTime}`);
      console.log(`   Description: ${harwat.description.substring(0, 50)}...`);
      console.log(`   Photos: ${harwat.photos ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Test creating a new harwat
    console.log('🧪 Testing create harwat...');
    const newHarwat = await prisma.harwat.create({
      data: {
        title: 'Test Harwat ' + Date.now(),
        dateTime: new Date(),
        description: 'Ini adalah test harwat untuk memastikan fungsionalitas berjalan dengan baik.',
        photos: null
      }
    });
    
    console.log('✅ Harwat created successfully:', newHarwat.title);
    
    // Clean up test data
    await prisma.harwat.delete({
      where: { id: newHarwat.id }
    });
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing harwat:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testHarwat();
