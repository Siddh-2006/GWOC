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

    // LIST OF PATHS TO PROBE
    const probes = [
        { path: "/", method: "GET" },
        { path: "/api/chat", method: "POST", body: '{}' },
        { path: "/chat", method: "POST", body: '{}' },
        { path: "/test-chatbot/", method: "GET" },
        { path: "/test-chatbot/api/chat", method: "POST", body: '{}' },
        { path: "/test-chatbot/chat", method: "POST", body: '{}' }
    ];

    for (const p of probes) {
        try {
            const opts = { method: p.method };
            if (p.body) {
                opts.headers = { 'Content-Type': 'application/json' };
                opts.body = p.body;
            }
            const res = await fetch(`${baseUrl}${p.path}`, opts);
            console.log(`   Probe ${p.path.padEnd(25)} : ${res.status} ${res.statusText}`);
        } catch (e) {
            // console.log(`   Probe ${p.path} Error: ${e.message}`);
        }
    }

    // ACTUAL SUCCESS CHECK (Original Logic)
    try {
        const start = Date.now();
        // Try the standard path first, but if probes found something else, use that?
        // Let's stick to the config path for the "Official" test
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

// 1. Test What's in .env (Skip Local to save time if verified)
// console.log("1️⃣  Checking Local Config (VITE_CHATBOT_API_URL)...");
// await testConnection("Local/Env Config", LOCAL_URL);

// 2. Test Production
console.log("2️⃣  Checking Production (Default Fallback)...");
await testConnection("Production (Vercel)", PROD_URL);
