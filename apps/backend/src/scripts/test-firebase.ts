/**
 * Test Script for Firebase Connection
 *
 * This script verifies:
 * - Firebase Admin SDK initializes correctly
 * - Can write to Realtime Database
 * - Can read from Realtime Database
 * - Database URL is accessible
 *
 * Usage: npm run test:firebase
 *    or: node dist/scripts/test-firebase.js
 */

import 'dotenv/config';
import { initializeFirebase } from '../config/firebase.js';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  test: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await test();
    const duration = Date.now() - start;
    results.push({ name, status: 'PASS', message: 'Success', duration });
    console.log(`✅ ${name}`);
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, status: 'FAIL', message, duration });
    console.log(`❌ ${name}: ${message}`);
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Firebase Connection Test - Step 1 & 2 Verification');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get database reference (initialize once)
  const db = initializeFirebase();

  // Test 1: Firebase Initialization
  await runTest('1. Firebase Admin SDK Initialization', async () => {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
  });

  // Test 2: Write to Firebase
  await runTest('2. Write test data to Firebase', async () => {
    const testRef = db.ref('quikstrike/test/connection');
    await testRef.set({
      timestamp: Date.now(),
      message: 'Test connection from backend',
      status: 'ok'
    });
  });

  // Test 3: Read from Firebase
  await runTest('3. Read test data from Firebase', async () => {
    const testRef = db.ref('quikstrike/test/connection');
    const snapshot = await testRef.get();

    if (!snapshot.exists()) {
      throw new Error('No data found at test path');
    }

    const data = snapshot.val();
    if (!data.status || data.status !== 'ok') {
      throw new Error('Unexpected data value');
    }
  });

  // Test 4: Write options snapshot (simulate real data)
  await runTest('4. Write options snapshot structure', async () => {
    const snapshot = {
      updatedAt: Date.now(),
      sessionStart: Date.now() - 86400000,
      underlyingPrice: 97500.50,
      atmStrike: 97500,
      strikes: [90000, 92500, 95000, 97500, 100000],
      callVolByStrike: [100, 200, 300, 400, 500],
      putVolByStrike: [500, 400, 300, 200, 100],
      ivByStrike: [0.5, 0.48, 0.46, 0.44, 0.46],
      meta: {
        source: 'binance',
        expiries: ['2026-01-31']
      }
    };

    await db.ref('quikstrike/BTC/options/2026-01-31/latest').set(snapshot);
  });

  // Test 5: Read options snapshot
  await runTest('5. Read options snapshot', async () => {
    const testRef = db.ref('quikstrike/BTC/options/2026-01-31/latest');
    const snapshot = await testRef.get();

    if (!snapshot.exists()) {
      throw new Error('Options snapshot not found');
    }

    const data = snapshot.val();
    if (data.underlyingPrice !== 97500.50) {
      throw new Error('Unexpected underlying price value');
    }
  });

  // Test 6: Cleanup test data
  await runTest('6. Cleanup test data', async () => {
    await db.ref('quikstrike/test').remove();
    await db.ref('quikstrike/BTC/options/2026-01-31').remove();
  });

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name} (${result.duration}ms)`);
    if (result.status === 'FAIL') {
      console.log(`   Error: ${result.message}`);
    }
  });

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`Total: ${results.length} tests, ${passed} passed, ${failed} failed`);
  console.log(`Total duration: ${totalDuration}ms`);
  console.log('───────────────────────────────────────────────────────────\n');

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Please check your Firebase configuration.\n');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed! Step 1 & 2 are working correctly.\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
