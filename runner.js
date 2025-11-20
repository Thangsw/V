#!/usr/bin/env node

/**
 * Whisk AI Image Generator - Unified Runner
 *
 * This script provides a single entry point to start the Whisk AI application.
 * It handles initialization, dependency checks, and server startup.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = (msg, color = 'reset') => {
  console.log(`${colors[color]}${msg}${colors.reset}`);
};

const banner = () => {
  log('\n' + '='.repeat(60), 'cyan');
  log('  🎨 WHISK AI - IMAGE GENERATOR', 'bright');
  log('  Google Labs Whisk API Integration', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
};

const checkDependencies = () => {
  log('🔍 Checking dependencies...', 'blue');

  const packageJson = require('./package.json');
  const dependencies = Object.keys(packageJson.dependencies || {});

  const missing = [];
  for (const dep of dependencies) {
    try {
      require.resolve(dep);
    } catch (e) {
      missing.push(dep);
    }
  }

  if (missing.length > 0) {
    log('❌ Missing dependencies:', 'red');
    missing.forEach(dep => log(`   - ${dep}`, 'yellow'));
    log('\n💡 Run: npm install\n', 'cyan');
    process.exit(1);
  }

  log('✅ All dependencies installed\n', 'green');
};

const createDirectories = () => {
  log('📁 Creating required directories...', 'blue');

  const dirs = ['images', 'assets', 'projects'];

  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`   ✓ Created: ${dir}/`, 'green');
    }
  });

  log('✅ Directories ready\n', 'green');
};

const printInstructions = () => {
  log('📋 QUICK START GUIDE:', 'bright');
  log('─'.repeat(60), 'cyan');
  log('1. Server starting on: http://localhost:3002', 'yellow');
  log('2. Open in browser:    http://localhost:3002/index2.html', 'yellow');
  log('3. Click "🚀 Khởi động Chrome" to launch browser', 'yellow');
  log('4. Login to Google account if needed', 'yellow');
  log('5. Click "Bắt Token" to capture credentials', 'yellow');
  log('6. Start generating images!', 'yellow');
  log('─'.repeat(60) + '\n', 'cyan');
};

const startServer = () => {
  log('🚀 Starting Whisk AI Server...\n', 'bright');

  printInstructions();

  const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  serverProcess.on('error', (err) => {
    log(`❌ Failed to start server: ${err.message}`, 'red');
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      log(`\n❌ Server exited with code ${code}`, 'red');
    } else {
      log('\n✅ Server stopped gracefully', 'green');
    }
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    log('\n\n🛑 Shutting down server...', 'yellow');
    serverProcess.kill('SIGINT');
  });
};

// Main execution
const main = () => {
  try {
    banner();
    checkDependencies();
    createDirectories();
    startServer();
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
