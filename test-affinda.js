/**
 * Quick test script to verify Affinda API is working
 * Run: node test-affinda.js
 */

require('dotenv').config();
const axios = require('axios');

const affindaKey = process.env.AFFINDA_API_KEY;

console.log('🔍 Affinda API Test');
console.log('====================');
console.log('');

// Check if key exists
if (!affindaKey) {
  console.error('❌ ERROR: AFFINDA_API_KEY is not set!');
  console.error('   Make sure you updated Vercel environment variables and redeployed.');
  process.exit(1);
}

console.log('✓ AFFINDA_API_KEY found (length: ' + affindaKey.length + ' chars)');
console.log('');

// Test the API connection
async function testAffindaAPI() {
  try {
    console.log('🔄 Testing connection to Affinda API...');
    
    // Simple API test - check rate limits
    const response = await axios.get('https://api.affinda.com/v3/organizations', {
      headers: {
        'Authorization': `Bearer ${affindaKey}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ SUCCESS! Affinda API is working properly!');
    console.log('');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2).substring(0, 300) + '...');
    console.log('');
    console.log('✓ API key is valid and authenticated');
    console.log('✓ Resume parsing should work now');
    
  } catch (error) {
    console.error('❌ FAILED! Affinda API test failed.');
    console.error('');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data?.message || error.response.data);
      
      if (error.response.status === 401) {
        console.error('');
        console.error('💡 Possible causes:');
        console.error('   1. API key is invalid or expired');
        console.error('   2. API key has wrong permissions');
        console.error('   3. API key has been revoked');
        console.error('');
        console.error('👉 Solution:');
        console.error('   - Go to: https://affinda.com/settings/api');
        console.error('   - Delete the old key');
        console.error('   - Create a new API key');
        console.error('   - Update in Vercel: https://vercel.com/dashboard');
        console.error('   - Redeploy');
      } else if (error.response.status === 403) {
        console.error('');
        console.error('💡 Access forbidden - API key may lack proper scopes');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Status: Connection refused');
      console.error('Reason: Cannot reach API server');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Status: Request timeout');
      console.error('Reason: API server is slow or unreachable');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAffindaAPI();
