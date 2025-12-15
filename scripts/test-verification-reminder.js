#!/usr/bin/env node

/**
 * Test script for Verification Reminder endpoint
 * Usage: node scripts/test-verification-reminder.js [secret]
 */

import https from 'https';
import http from 'http';

const args = process.argv.slice(2);
const secret = args[0] || process.env.CRON_SECRET || 'your-secret-key-change-this';

// Get URL from args or use default
const baseUrl = args[1] || process.env.API_URL || 'http://localhost:5000';
const isProduction = baseUrl.includes('housedirectng.com') || baseUrl.includes('vercel.app');

console.log('🧪 Testing Verification Reminder Endpoint\n');
console.log(`📍 URL: ${baseUrl}`);
console.log(`🔑 Secret: ${secret.substring(0, 10)}...`);
console.log(`🌐 Environment: ${isProduction ? 'Production' : 'Local'}\n`);

// Test 1: Health Check
console.log('📋 Test 1: Health Check');
testEndpoint(`${baseUrl}/api/scheduled/health`, 'GET', null)
  .then(() => {
    console.log('✅ Health check passed\n');
    
    // Test 2: Verification Reminders (with secret)
    console.log('📋 Test 2: Verification Reminders Endpoint');
    return testEndpoint(
      `${baseUrl}/api/scheduled/verification-reminders?secret=${secret}`,
      'POST',
      null
    );
  })
  .then(() => {
    console.log('\n✅ All tests completed!');
    console.log('\n📧 Check your email inboxes for verification reminder emails.');
    console.log('📊 Check Vercel logs if testing production.');
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });

function testEndpoint(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': secret,
      },
    };

    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Status: ${res.statusCode}`);
            console.log('📦 Response:', JSON.stringify(json, null, 2));
            
            if (json.stats) {
              console.log('\n📊 Statistics:');
              console.log(`   Agents Contacted: ${json.stats.agentsContacted || 0}`);
              console.log(`   Sellers Contacted: ${json.stats.sellersContacted || 0}`);
              console.log(`   Total Contacted: ${json.stats.totalContacted || 0}`);
              console.log(`   Total Failed: ${json.stats.totalFailed || 0}`);
              
              if (json.stats.errors && json.stats.errors.length > 0) {
                console.log('\n⚠️  Errors:');
                json.stats.errors.forEach((error, i) => {
                  console.log(`   ${i + 1}. ${error}`);
                });
              }
            }
            
            resolve(json);
          } else {
            console.error(`❌ Status: ${res.statusCode}`);
            console.error('📦 Response:', json);
            reject(new Error(`HTTP ${res.statusCode}: ${json.message || json.error || 'Unknown error'}`));
          }
        } catch (e) {
          console.error('❌ Failed to parse response:', body);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      console.error('\n💡 Tips:');
      console.error('   - Make sure the backend server is running');
      console.error('   - Check the URL is correct');
      console.error('   - For local testing: cd backend && npm run dev');
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}
