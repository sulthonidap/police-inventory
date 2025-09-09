const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugHarwatAPI() {
  try {
    console.log('🔍 Debugging Harwat API...\n');
    
    // Test 1: Check database connection and schema
    console.log('1️⃣ Checking database connection...');
    const harwatCount = await prisma.harwat.count();
    console.log(`✅ Database connected. Harwat count: ${harwatCount}`);
    
    // Test 2: Check if we can create harwat with minimal data
    console.log('\n2️⃣ Testing minimal harwat creation...');
    try {
      const minimalHarwat = await prisma.harwat.create({
        data: {
          title: 'Minimal Test',
          dateTime: new Date(),
          description: 'Minimal test data',
          photos: null
        }
      });
      console.log(`✅ Minimal creation successful: ${minimalHarwat.id}`);
      
      // Clean up
      await prisma.harwat.delete({ where: { id: minimalHarwat.id } });
      console.log('✅ Minimal test cleaned up');
    } catch (error) {
      console.log(`❌ Minimal creation failed: ${error.message}`);
    }
    
    // Test 3: Check if we can create harwat with photos
    console.log('\n3️⃣ Testing harwat creation with photos...');
    try {
      const harwatWithPhotos = await prisma.harwat.create({
        data: {
          title: 'Test with Photos',
          dateTime: new Date(),
          description: 'Test with photos data',
          photos: JSON.stringify(['/uploads/harwat/test1.jpg', '/uploads/harwat/test2.jpg'])
        }
      });
      console.log(`✅ Photos creation successful: ${harwatWithPhotos.id}`);
      console.log(`📸 Photos: ${harwatWithPhotos.photos}`);
      
      // Clean up
      await prisma.harwat.delete({ where: { id: harwatWithPhotos.id } });
      console.log('✅ Photos test cleaned up');
    } catch (error) {
      console.log(`❌ Photos creation failed: ${error.message}`);
    }
    
    // Test 4: Test API endpoint with detailed error handling
    console.log('\n4️⃣ Testing API endpoint with detailed error...');
    try {
      const response = await fetch('https://police-inventory.vercel.app/api/harwat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          title: 'API Test ' + Date.now(),
          dateTime: new Date().toISOString(),
          description: 'API test data'
        })
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log(`Response body: ${responseText}`);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log(`✅ API creation successful: ${result.title}`);
        
        // Clean up
        await prisma.harwat.delete({ where: { id: result.id } });
        console.log('✅ API test cleaned up');
      } else {
        console.log(`❌ API creation failed: ${response.status} - ${responseText}`);
      }
    } catch (apiError) {
      console.log(`❌ API request failed: ${apiError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error debugging harwat:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugHarwatAPI();
