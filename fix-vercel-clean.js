const fs = require('fs');
const path = require('path');

// Konfigurasi Vercel yang bersih
const VERCEL_CONFIG = `// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30`;

// Fungsi untuk membersihkan dan menambahkan konfigurasi
function cleanAndAddConfig(content) {
  // Hapus semua konfigurasi Vercel yang ada (termasuk yang duplikat)
  let cleanedContent = content
    .replace(/\/\/ Konfigurasi untuk Vercel deployment.*?\nexport const maxDuration = \d+/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const maxDuration = \d+/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const preferredRegion = 'auto'/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const dynamic = 'force-dynamic'/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const dynamic = 'force-dynamic'.*?\nexport const preferredRegion = 'auto'/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const dynamic = 'force-dynamic'.*?\nexport const preferredRegion = 'auto'.*?\nexport const maxDuration = \d+/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const dynamic = 'force-dynamic'.*?\nexport const preferredRegion = 'auto'.*?\nexport const maxDuration = \d+/gs, '')
    .replace(/export const preferredRegion = 'auto'.*?\nexport const maxDuration = \d+/gs, '')
    .replace(/export const preferredRegion = 'auto'/g, '')
    .replace(/export const maxDuration = \d+/g, '')
    .replace(/export const runtime = 'nodejs'/g, '')
    .replace(/export const dynamic = 'force-dynamic'/g, '');
  
  // Hapus baris kosong yang berlebihan
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Tambahkan konfigurasi baru setelah import
  const importEndIndex = cleanedContent.lastIndexOf('import');
  if (importEndIndex === -1) return cleanedContent;
  
  const importEndLine = cleanedContent.indexOf('\n', importEndIndex);
  if (importEndLine === -1) return cleanedContent;
  
  // Cari baris setelah semua import
  let insertPosition = importEndLine;
  while (insertPosition < cleanedContent.length) {
    const nextLine = cleanedContent.indexOf('\n', insertPosition + 1);
    if (nextLine === -1) break;
    
    const lineContent = cleanedContent.substring(insertPosition + 1, nextLine).trim();
    if (lineContent && !lineContent.startsWith('import') && !lineContent.startsWith('//')) {
      break;
    }
    insertPosition = nextLine;
  }
  
  return cleanedContent.slice(0, insertPosition) + '\n' + VERCEL_CONFIG + '\n' + cleanedContent.slice(insertPosition);
}

// Fungsi untuk memproses file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip jika bukan route.ts
    if (!filePath.endsWith('route.ts')) return;
    
    const newContent = cleanAndAddConfig(content);
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Cleaned and updated: ${filePath}`);
    } else {
      console.log(`⏭️  Already clean: ${filePath}`);
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
console.log('🧹 Cleaning and updating API routes with clean Vercel configuration...\n');

if (fs.existsSync(apiDir)) {
  scanDirectory(apiDir);
  console.log('\n✨ Clean Vercel configuration update completed!');
} else {
  console.log('❌ API directory not found!');
}
