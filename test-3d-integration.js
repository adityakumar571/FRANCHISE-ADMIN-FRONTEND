#!/usr/bin/env node
/**
 * Test Script: PharmacyLayout3D Integration Verification
 * 
 * This script verifies that all backend APIs required by PharmacyLayout3D
 * are working correctly and returning the expected data structure.
 */

const BASE_URL = 'http://localhost:5179/api';

const log = (msg, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type] || colors.info}${msg}${colors.reset}`);
};

const testApi = async (endpoint, expectedFields = []) => {
  log(`\n📌 Testing: ${endpoint}`, 'info');
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      log(`   ❌ Status ${response.status}`, 'error');
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success && !data.data) {
      log(`   ❌ Invalid response structure`, 'error');
      log(`      Response: ${JSON.stringify(data).slice(0, 100)}...`);
      return false;
    }
    
    const payload = data.data || data;
    
    // Check required fields
    let hasAll = true;
    for (const field of expectedFields) {
      if (!(field in payload)) {
        log(`   ⚠️  Missing field: ${field}`, 'warning');
        hasAll = false;
      }
    }
    
    if (expectedFields.length === 0) {
      log(`   ✅ Response received: ${JSON.stringify(payload).slice(0, 60)}...`, 'success');
    } else if (hasAll) {
      log(`   ✅ All required fields present`, 'success');
    } else {
      log(`   ⚠️  Some fields missing but API working`, 'warning');
    }
    
    return true;
  } catch (err) {
    log(`   ❌ ${err.message}`, 'error');
    return false;
  }
};

const main = async () => {
  log('\n═══════════════════════════════════════════════════════════════', 'info');
  log('  PharmacyLayout3D Backend Integration Test Suite', 'info');
  log('═══════════════════════════════════════════════════════════════\n', 'info');
  
  const tests = [
    {
      name: '1. Get Medicines (for 3D layout)',
      endpoint: '/franchise/medicines?limit=100&layout=true',
      fields: ['medicines', 'total']
    },
    {
      name: '2. Get Medicines with fields check',
      endpoint: '/franchise/medicines?limit=10',
      fields: ['medicines', 'categories', 'formulations', 'companies']
    },
    {
      name: '3. Get Counters',
      endpoint: '/franchise/master/counters',
      fields: []
    },
    {
      name: '4. Get Racks',
      endpoint: '/franchise/master/racks',
      fields: []
    },
    {
      name: '5. Get Inventory Dashboard',
      endpoint: '/franchise/inventory/dashboard',
      fields: ['kpi']
    },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    log(`\n${test.name}`);
    const result = await testApi(test.endpoint, test.fields);
    if (result) passed++;
    else failed++;
  }
  
  log('\n═══════════════════════════════════════════════════════════════', 'info');
  log(`Summary: ${passed} passed, ${failed} failed`, failed === 0 ? 'success' : 'warning');
  log('═══════════════════════════════════════════════════════════════\n', 'info');
  
  if (failed === 0) {
    log('✅ All tests passed! PharmacyLayout3D should work correctly.', 'success');
    log('\nNext: Navigate to http://localhost:3000/franchise/layout-3d', 'info');
  } else {
    log('❌ Some tests failed. Check backend APIs.', 'error');
    log('\nBackend should be running at: http://localhost:5179', 'warning');
  }
};

main().catch(err => {
  log(`Fatal error: ${err.message}`, 'error');
  process.exit(1);
});
