const fs = require('fs');
const path = require('path');

// Konfigurasi Vercel yang lengkap
const VERCEL_CONFIG = `// Konfigurasi untuk Vercel deployment - HARUS ADA
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30`;

// Fungsi untuk update konfigurasi
function updateVercelConfig(content) {
  // Hapus konfigurasi lama jika ada
  let newContent = content
    .replace(/\/\/ Konfigurasi untuk Vercel deployment.*?\nexport const maxDuration = \d+/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const maxDuration = \d+/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const preferredRegion = 'auto'/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const dynamic = 'force-dynamic'/gs, '')
    .replace(/export const runtime = 'nodejs'.*?\nexport const dynamic = 'force-dynamic'.*?\nexport const preferredRegion = 'auto'/gs, '');
  
  // Tambahkan konfigurasi baru setelah import
  const importEndIndex = content.lastIndexOf('import');
  if (importEndIndex === -1) return content;
  
  const importEndLine = content.indexOf('\n', importEndIndex);
  if (importEndLine === -1) return content;
  
  // Cari baris setelah semua import
  let insertPosition = importEndLine;
  while (insertPosition < content.length) {
    const nextLine = content.indexOf('\n', insertPosition + 1);
    if (nextLine === -1) break;
    
    const lineContent = content.substring(insertPosition + 1, nextLine).trim();
    if (lineContent && !lineContent.startsWith('import') && !lineContent.startsWith('//')) {
      break;
    }
    insertPosition = nextLine;
  }
  
  return content.slice(0, insertPosition) + '\n' + VERCEL_CONFIG + '\n' + content.slice(insertPosition);
}

// Fungsi untuk memproses file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip jika bukan route.ts
    if (!filePath.endsWith('route.ts')) return;
    
    const newContent = updateVercelConfig(content);
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  Already configured: ${filePath}`);
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
console.log('🔍 Scanning API routes for COMPLETE Vercel configuration...\n');

if (fs.existsSync(apiDir)) {
  scanDirectory(apiDir);
  console.log('\n✨ Complete Vercel configuration update finished!');
} else {
  console.log('❌ API directory not found!');
}
