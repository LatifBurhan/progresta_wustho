// Helper script to update environment variables
// Usage: node update-env.js YOUR_ANON_KEY_HERE

const fs = require('fs');
const path = require('path');

const anonKey = process.argv[2];

if (!anonKey) {
  console.log('❌ Please provide the anon key as argument');
  console.log('Usage: node update-env.js YOUR_ANON_KEY_HERE');
  process.exit(1);
}

const envPath = path.join(__dirname, '.env.local');
const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pkjghohbvfzhdryaupe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
`;

fs.writeFileSync(envPath, envContent);
console.log('✅ Environment variables updated successfully!');
console.log('🚀 You can now run: bun dev');