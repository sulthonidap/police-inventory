const fs = require('fs');
const path = require('path');

// Fungsi untuk menambahkan konfigurasi Vercel
function addVercelConfig(content) {
  // Cek apakah sudah ada konfigurasi
  if (content.includes('export const preferredRegion')) {
    return content;
  }
  
  // Tambahkan konfigurasi setelah import
  const importEndIndex = content.lastIndexOf('import');
  if (importEndIndex === -1) return content;
  
  const importEndLine = content.indexOf('\n', importEndIndex);
  if (importEndLine === -1) return content;
  
  const configToAdd = '\nexport const preferredRegion = \'auto\'';
  
  return content.slice(0, importEndLine) + configToAdd + content.slice(importEndLine);
}

// Fungsi untuk memproses file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Cek apakah sudah ada runtime config
    if (content.includes('export const runtime') && content.includes('export const dynamic')) {
      const newContent = addVercelConfig(content);
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ Updated: ${filePath}`);
      } else {
        console.log(`⏭️  Already configured: ${filePath}`);
      }
    } else {
      console.log(`⚠️  Missing runtime config: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Fungsi untuk scan directory
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file === 'route.ts') {
      processFile(filePath);
    }
  });
}

// Mulai scan dari src/app/api
const apiDir = path.join(__dirname, 'src', 'app', 'api');
console.log('🔍 Scanning API routes for Vercel configuration...\n');

if (fs.existsSync(apiDir)) {
  scanDirectory(apiDir);
  console.log('\n✨ Vercel configuration update completed!');
} else {
  console.log('❌ API directory not found!');
}
