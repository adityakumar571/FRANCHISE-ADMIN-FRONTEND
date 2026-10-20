/* eslint-disable prettier/prettier */
/**
 * PTR System - Quick Test Demo
 * Run this file to test all utilities
 */

import { validatePTR, calculateStandardPTR, comparePTR, batchValidatePTR } from '../ptrValidation'
import { calculateEffectiveRate, formatScheme, calculateMarginWithScheme, compareSchemes } from '../schemeCalculator'

console.log('🧪 PTR SYSTEM TEST DEMO\n')
console.log('═'.repeat(60))

// Test 1: Valid PTR
console.log('\n📌 Test 1: Valid PTR')
console.log('Input: PTR = ₹450, MRP = ₹500')
const test1 = validatePTR(450, 500)
console.log('Result:', test1)
console.log('✅ Expected: valid=true, margin=10%')

// Test 2: Invalid PTR (PTR >= MRP)
console.log('\n📌 Test 2: Invalid PTR (PTR >= MRP)')
console.log('Input: PTR = ₹510, MRP = ₹500')
const test2 = validatePTR(510, 500)
console.log('Result:', test2)
console.log('❌ Expected: valid=false, error="PTR must be less than MRP"')

// Test 3: Low Margin Warning
console.log('\n📌 Test 3: Low Margin Warning')
console.log('Input: PTR = ₹490, MRP = ₹500')
const test3 = validatePTR(490, 500)
console.log('Result:', test3)
console.log('⚠️ Expected: valid=true, warnings about low margin')

// Test 4: Calculate Standard PTR
console.log('\n📌 Test 4: Calculate Standard PTR')
console.log('Input: MRP = ₹500, Category = "Generic"')
const test4 = calculateStandardPTR(500, 'Generic')
console.log('Result: ₹', test4)
console.log('✅ Expected: ₹400 (20% margin)')

// Test 5: PTR Comparison
console.log('\n📌 Test 5: PTR Comparison')
console.log('Input: Current PTR = ₹470, Last PTR = ₹450')
const test5 = comparePTR(470, 450)
console.log('Result:', test5)
console.log('ℹ️ Expected: increased by ~4.4%')

// Test 6: Scheme - Buy X Get Y
console.log('\n📌 Test 6: Scheme Calculation - Buy 10 Get 2')
console.log('Input: PTR = ₹100, Scheme = "10+2"')
const test6 = calculateEffectiveRate(100, '10+2')
console.log('Result:', test6)
console.log('✅ Expected: effectivePTR=₹83.33, savings=₹16.67')

// Test 7: Scheme - Percentage Discount
console.log('\n📌 Test 7: Scheme Calculation - 5% Discount')
console.log('Input: PTR = ₹200, Scheme = "5%"')
const test7 = calculateEffectiveRate(200, '5%')
console.log('Result:', test7)
console.log('✅ Expected: effectivePTR=₹190, savings=₹10')

// Test 8: Format Scheme
console.log('\n📌 Test 8: Format Scheme')
console.log('Input: "10+2"')
const test8 = formatScheme('10+2')
console.log('Result:', test8)
console.log('✅ Expected: "Buy 10 Get 2 Free"')

// Test 9: Margin with Scheme
console.log('\n📌 Test 9: Margin Calculation with Scheme')
console.log('Input: PTR = ₹100, MRP = ₹120, Scheme = "10+2"')
const test9 = calculateMarginWithScheme(100, 120, '10+2')
console.log('Result:', test9)
console.log('✅ Expected: basicMargin=16.67%, effectiveMargin=30.56%')

// Test 10: Compare Suppliers
console.log('\n📌 Test 10: Compare Suppliers')
const suppliers = [
  { name: 'Supplier A', ptr: 100, mrp: 120, scheme: '10+2' },
  { name: 'Supplier B', ptr: 95, mrp: 120, scheme: '5%' },
  { name: 'Supplier C', ptr: 98, mrp: 120, scheme: null },
]
console.log('Input: 3 suppliers with different schemes')
const test10 = compareSchemes(suppliers)
console.log('Result (sorted by best effective rate):')
test10.forEach((s, i) => {
  console.log(`  ${i + 1}. ${s.name}: PTR=₹${s.ptr}, Effective=₹${s.effectivePTR.toFixed(2)}, Margin=${s.effectiveMargin}%`)
})
console.log('✅ Expected: Sorted from lowest to highest effective PTR')

// Test 11: Batch Validation
console.log('\n📌 Test 11: Batch Validation')
const items = [
  { ptr: 450, mrp: 500, name: 'Medicine A' },
  { ptr: 510, mrp: 500, name: 'Medicine B' }, // Invalid
  { ptr: 490, mrp: 500, name: 'Medicine C' }, // Low margin
]
console.log('Input: 3 medicines (1 valid, 1 invalid, 1 low margin)')
const test11 = batchValidatePTR(items)
console.log('Result:', test11.summary)
console.log('✅ Expected: valid=false, invalid=1, warnings=1')

console.log('\n' + '═'.repeat(60))
console.log('🎉 All tests complete!')
console.log('\nTo run this test:')
console.log('  node src/utils/__tests__/ptr-test-demo.js')
