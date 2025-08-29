#!/usr/bin/env node

/**
 * Script untuk generate NEXTAUTH_SECRET yang aman
 * Jalankan: node scripts/generate-secret.js
 */

const crypto = require('crypto');

// Generate random secret
const secret = crypto.randomBytes(32).toString('hex');

console.log('🔐 Generated NEXTAUTH_SECRET:');
console.log('=====================================');
console.log(secret);
console.log('=====================================');
console.log('\n📝 Copy secret ini ke environment variables Vercel');
console.log('⚠️  Jangan share secret ini ke publik!');
console.log('\n🔗 Vercel Dashboard: https://vercel.com/dashboard');
console.log('📁 Project Settings > Environment Variables');
