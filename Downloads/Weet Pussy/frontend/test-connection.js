#!/usr/bin/env node
/**
 * Test script to verify frontend can connect to deployed backend
 */

import axios from 'axios';

const API_BASE_URL = 'https://sweet-karma-shop.onrender.com/api';

async function testConnection() {
  console.log('🔍 Testing connection to deployed backend...');
  console.log(`📡 Backend URL: ${API_BASE_URL}`);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('https://sweet-karma-shop.onrender.com/health', {
      timeout: 10000
    });
    console.log('✅ Health check:', healthResponse.data);
    
    // Test API root
    console.log('\n2. Testing API root...');
    const rootResponse = await axios.get('https://sweet-karma-shop.onrender.com/', {
      timeout: 10000
    });
    console.log('✅ API root:', rootResponse.data);
    
    // Test sweets endpoint
    console.log('\n3. Testing sweets endpoint...');
    const sweetsResponse = await axios.get(`${API_BASE_URL}/sweets`, {
      timeout: 10000
    });
    console.log('✅ Sweets endpoint:', `Found ${sweetsResponse.data.length} sweets`);
    
    console.log('\n🎉 All tests passed! Frontend can successfully connect to backend.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if backend is deployed and running');
    console.log('2. Verify CORS settings allow your frontend domain');
    console.log('3. Check network connectivity');
  }
}

testConnection();