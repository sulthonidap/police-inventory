const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testHarwatWithPhotos() {
  try {
    console.log('🔍 Testing Harwat with photos...\n');
    
    // Test 1: Create harwat with photos via API
    console.log('1️⃣ Testing API with photos...');
    
    // Create a simple test image file
    const testImagePath = path.join(process.cwd(), 'test-image.txt');
    fs.writeFileSync(testImagePath, 'This is a test image content');
    
    const formData = new FormData();
    formData.append('title', 'Test Harwat dengan Foto ' + Date.now());
    formData.append('dateTime', new Date().toISOString());
    formData.append('description', 'Test harwat dengan foto via API endpoint');
    
    // Create a File object from the test file
    const fileContent = fs.readFileSync(testImagePath);
    const file = new File([fileContent], 'test-image.txt', { type: 'text/plain' });
    formData.append('photos', file);
    
    try {
      const response = await fetch('https://police-inventory.vercel.app/api/harwat', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ API creation with photos successful: ${result.title}`);
        console.log(`📸 Photos: ${result.photos}`);
      } else {
        const error = await response.text();
        console.log(`❌ API creation failed: ${response.status} - ${error}`);
      }
    } catch (apiError) {
      console.log(`❌ API request failed: ${apiError.message}`);
    }
    
    // Clean up test files
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
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
    console.error('❌ Error testing harwat with photos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testHarwatWithPhotos();
