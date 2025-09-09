// Script untuk membuat admin account secara manual
// Buka browser dan akses: https://police-inventory.vercel.app/api/admin/setup-simple

const adminData = {
  name: "Super Admin",
  email: "admin@polri.go.id", 
  password: "admin123456",
  nrp: "12345678901234567890",
  secretKey: "admin-setup-2024"
};

console.log('🔐 Admin Setup Data:');
console.log('📧 Email:', adminData.email);
console.log('🔑 Password:', adminData.password);
console.log('👤 Name:', adminData.name);
console.log('🆔 NRP:', adminData.nrp);
console.log('🔐 Secret Key:', adminData.secretKey);

console.log('\n📋 Cara membuat admin:');
console.log('1. Buka browser dan akses: https://police-inventory.vercel.app/api/admin/setup-simple');
console.log('2. Gunakan method POST dengan data JSON di atas');
console.log('3. Atau gunakan curl command:');

const curlCommand = `curl -X POST https://police-inventory.vercel.app/api/admin/setup-simple \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(adminData, null, 2)}'`;

console.log('\n🔧 Curl Command:');
console.log(curlCommand);

console.log('\n🌐 Atau gunakan Postman/Insomnia dengan:');
console.log('URL: https://police-inventory.vercel.app/api/admin/setup-simple');
console.log('Method: POST');
console.log('Headers: Content-Type: application/json');
console.log('Body (JSON):');
console.log(JSON.stringify(adminData, null, 2));
