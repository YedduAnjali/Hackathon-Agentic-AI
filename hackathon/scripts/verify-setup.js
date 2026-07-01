#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required services and configurations are in place
 */

import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const checks = {
  env: false,
  backend: false,
  mongodb: false,
  huggingface: false,
  n8n: false
};

console.log('🔍 Verifying Agentic AI Platform Setup...\n');

// Check 1: Environment Variables
console.log('1. Checking environment variables...');
const requiredEnvVars = [
  'HF_API_KEY',
  'HF_MODEL',
  'N8N_WEBHOOK_URL',
  'MONGODB_URI',
  'PORT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length === 0) {
  console.log('   ✅ All required environment variables are set\n');
  checks.env = true;
} else {
  console.log(`   ❌ Missing variables: ${missingVars.join(', ')}\n`);
}

// Check 2: Backend Health
console.log('2. Checking backend server...');
try {
  const port = process.env.PORT || 5000;
  const response = await axios.get(`http://localhost:${port}/health`, { timeout: 3000 });
  if (response.data.status === 'ok') {
    console.log(`   ✅ Backend is running on port ${port}\n`);
    checks.backend = true;
  }
} catch (error) {
  console.log(`   ❌ Backend is not running (${error.message})\n`);
  console.log('   💡 Start backend with: npm run dev:backend\n');
}

// Check 3: MongoDB Connection
console.log('3. Checking MongoDB connection...');
try {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agentic_ai';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  console.log('   ✅ MongoDB connection successful\n');
  checks.mongodb = true;
  await mongoose.disconnect();
} catch (error) {
  console.log(`   ❌ MongoDB connection failed (${error.message})\n`);
  console.log('   💡 Start MongoDB or check MONGODB_URI in .env\n');
}

// Check 4: Hugging Face API
console.log('4. Checking Hugging Face API...');
if (process.env.HF_API_KEY && process.env.HF_API_KEY !== 'your_huggingface_api_key') {
  try {
    const model = process.env.HF_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
    const response = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: 'test'
          }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        validateStatus: (status) => status < 500 // Accept 503 (model loading)
      }
    );
    if (response.status === 200 || response.status === 503) {
      console.log('   ✅ Hugging Face API key is valid\n');
      if (response.status === 503) {
        console.log('   ⚠️  Model is loading (this is normal on first request)\n');
      }
      checks.huggingface = true;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ❌ Invalid Hugging Face API key\n');
    } else if (error.response?.status === 404) {
      console.log('   ❌ Model not found (check HF_MODEL in .env)\n');
    } else {
      console.log(`   ⚠️  API check failed: ${error.message}\n`);
    }
  }
} else {
  console.log('   ❌ HF_API_KEY not set or using placeholder\n');
}

// Check 5: n8n Webhook
console.log('5. Checking n8n webhook...');
if (process.env.N8N_WEBHOOK_URL) {
  try {
    const response = await axios.post(
      process.env.N8N_WEBHOOK_URL,
      {
        workflowType: 'test',
        task: 'verification'
      },
      {
        timeout: 5000,
        validateStatus: () => true // Accept any status
      }
    );
    if (response.status === 200 || response.status === 404) {
      console.log('   ✅ n8n webhook is accessible\n');
      checks.n8n = true;
    } else {
      console.log(`   ⚠️  n8n returned status ${response.status}\n`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ n8n is not running\n');
      console.log('   💡 Start n8n with: n8n start\n');
    } else {
      console.log(`   ⚠️  n8n check failed: ${error.message}\n`);
    }
  }
} else {
  console.log('   ❌ N8N_WEBHOOK_URL not set\n');
}

// Summary
console.log('\n📊 Setup Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(checks).forEach(([check, passed]) => {
  const icon = passed ? '✅' : '❌';
  const name = check.charAt(0).toUpperCase() + check.slice(1);
  console.log(`${icon} ${name}`);
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const allPassed = Object.values(checks).every(check => check);
if (allPassed) {
  console.log('🎉 All checks passed! Platform is ready to use.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above.\n');
  console.log('📖 See docs/SETUP_GUIDE.md for detailed setup instructions.\n');
  process.exit(1);
}
