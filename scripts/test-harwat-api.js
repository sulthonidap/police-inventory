const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHarwatAPI() {
  try {
    console.log('🔍 Testing Harwat API functionality...\n');
    
    // Test 1: Check if we can connect to database
    console.log('1️⃣ Testing database connection...');
    const harwatCount = await prisma.harwat.count();
    console.log(`✅ Database connected. Harwat count: ${harwatCount}`);
    
    // Test 2: Create harwat directly via Prisma
    console.log('\n2️⃣ Testing direct database creation...');
    const newHarwat = await prisma.harwat.create({
      data: {
        title: 'Test Harwat Direct ' + Date.now(),
        dateTime: new Date(),
        description: 'Test harwat created directly via Prisma.',
        photos: null
      }
    });
    console.log(`✅ Direct creation successful: ${newHarwat.title}`);
    
    // Test 3: Test API endpoint
    console.log('\n3️⃣ Testing API endpoint...');
    const formData = new FormData();
    formData.append('title', 'Test Harwat API ' + Date.now());
    formData.append('dateTime', new Date().toISOString());
    formData.append('description', 'Test harwat via API endpoint');
    
    try {
      const response = await fetch('https://police-inventory.vercel.app/api/harwat', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ API creation successful: ${result.title}`);
      } else {
        const error = await response.text();
        console.log(`❌ API creation failed: ${response.status} - ${error}`);
      }
    } catch (apiError) {
      console.log(`❌ API request failed: ${apiError.message}`);
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.harwat.deleteMany({
      where: {
        title: {
          startsWith: 'Test Harwat'
        }
      }
    });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing harwat:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testHarwatAPI();
