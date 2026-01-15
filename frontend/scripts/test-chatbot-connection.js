// scripts/test-chatbot-connection.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Mimic Vite's behavior: Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

const PROD_URL = "https://mindsettler-chatbot.vercel.app";
const LOCAL_URL = process.env.VITE_CHATBOT_API_URL || "NOT_SET";

async function testConnection(name, baseUrl) {
    console.log(`\nTesting ${name}: [${baseUrl}]...`);

    if (baseUrl === "NOT_SET" || !baseUrl.startsWith("http")) {
        console.log(`❌ Skipped: Invalid URL`);
        return;
    }

    // Probe 1: Root /
    try {
        const r1 = await fetch(`${baseUrl}/`);
        console.log(`   Probe / : ${r1.status} ${r1.statusText}`);
    } catch (e) { console.log(`   Probe / : Error ${e.message}`); }

    // Probe 2: Health
    try {
        const r2 = await fetch(`${baseUrl}/test-chatbot/health`);
        console.log(`   Probe /health : ${r2.status} ${r2.statusText}`);
    } catch (e) { console.log(`   Probe /health : Error ${e.message}`); }

    try {
        const start = Date.now();
        const response = await fetch(`${baseUrl}/test-chatbot/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello, are you online?" })
        });

        // Read raw text first to avoid JSON parse errors
        const text = await response.text();
        const duration = (Date.now() - start) / 1000;

        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log(`✅ Success (${duration.toFixed(2)}s)`);
                console.log(`   Response: "${data.text?.substring(0, 50)}..."`);
            } catch (e) {
                console.log(`❌ Success (200 OK) but Invalid JSON.`);
                console.log(`   Raw Output: ${text.substring(0, 150)}...`);
            }
        } else {
            console.log(`❌ Failed: HTTP ${response.status}`);
            console.log(`   Raw Output: ${text.substring(0, 150)}...`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.cause) console.log(error.cause);
    }
}

console.log("=== 🤖 Chatbot Connection Tester ===");

// 1. Test What's in .env (Local or Custom)
console.log("1️⃣  Checking Local Config (VITE_CHATBOT_API_URL)...");
await testConnection("Local/Env Config", LOCAL_URL);

// 2. Test Production (Fallback)
console.log("2️⃣  Checking Production (Default Fallback)...");
await testConnection("Production (Vercel)", PROD_URL);
