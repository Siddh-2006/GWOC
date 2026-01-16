import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const PROD_URL = "https://gwoc-t7pn.onrender.com";
const LOCAL_URL = "http://127.0.0.1:5001"; // Standard Flask Port

async function testEndpoint(envName, baseUrl) {
    console.log(`\n---------------------------------------------------`);
    console.log(`🔍 Testing ${envName}: [${baseUrl}]`);

    // We only test the standard endpoint now, as Render configuration is fixed
    const endpoint = `${baseUrl}/chat`;
    const payload = { message: "Hello! checking connection." };

    try {
        const start = Date.now();
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const duration = ((Date.now() - start) / 1000).toFixed(2);

        // Handle response
        const text = await response.text();

        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log(`✅ STATUS: ONLINE (${duration}s)`);
                console.log(`   Response Received: YES`);
                console.log(`   🤖 Bot Says: "${data.text}"`);
            } catch (jsonErr) {
                console.log(`⚠️ STATUS: 200 OK (But Invalid JSON)`);
                console.log(`   Raw Output: ${text.substring(0, 200)}...`);
            }
        } else {
            console.log(`❌ STATUS: FAILED (HTTP ${response.status})`);
            console.log(`   Error Message: ${text.substring(0, 200)}`);
        }

    } catch (err) {
        console.log(`❌ STATUS: UNREACHABLE`);
        if (err.cause) {
            console.log(`   Cause: Connection Refused (Is the server running?)`);
        } else {
            console.log(`   Error: ${err.message}`);
        }
    }
}

console.log("\n🚀 STARTING CONNECTION REPORT");
console.log("=============================");

// Run Tests Sequentially
(async () => {
    // 1. Test Local
    await testEndpoint("LOCAL (Development)", LOCAL_URL);

    // 2. Test Render
    await testEndpoint("RENDER (Production)", PROD_URL);

    console.log(`\n---------------------------------------------------`);
    console.log("🏁 REPORT COMPLETE");
})();
