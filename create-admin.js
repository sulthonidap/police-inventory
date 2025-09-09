const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const adminData = {
      name: "Super Admin",
      email: "admin@polri.go.id",
      password: "admin123456",
      nrp: "12345678901234567890",
      secretKey: "admin-setup-2024"
    };

    console.log('🔐 Creating admin account...');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', adminData.name);
    console.log('🆔 NRP:', adminData.nrp);

    const response = await fetch('https://police-inventory.vercel.app/api/admin/setup-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin account created successfully!');
      console.log('📋 Response:', result);
      console.log('\n🎉 You can now login with:');
      console.log('   Email: admin@polri.go.id');
      console.log('   Password: admin123456');
    } else {
      console.log('❌ Failed to create admin account');
      console.log('📋 Error:', result);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createAdmin();
