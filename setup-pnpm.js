const { execSync } = require('child_process');
const fs = require('fs');

// check if pnpm is installed
try {
  execSync('pnpm -v', { stdio: 'ignore' });
  console.log('✅ pnpm is installed.');
} catch (err) {
  console.error('❌ pnpm is not installed. Please install it first:');
  console.error('   npm install -g pnpm');
  process.exit(1);
}

// remove node_modules and package-lock.json
console.log('🧹 Cleaning up node_modules and package-lock.json...');

if (fs.existsSync('node_modules')) {
  execSync('rm -rf node_modules');
}

if (fs.existsSync('package-lock.json')) {
  fs.unlinkSync('package-lock.json');
}

// reinstall dependencies with pnpm
console.log('📦 Reinstalling dependencies with pnpm...');

try {
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('🎉 Setup complete! Your project is now using pnpm.');
} catch (err) {
  console.error('❌ Failed to install dependencies with pnpm.');
  process.exit(1);
}
