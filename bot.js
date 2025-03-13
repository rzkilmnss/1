const axios = require("axios");
const fs = require("fs");
const readline = require("readline");

// API URL
const API_URL = "https://www.aeropres.in/chromeapi/dawn/v1/userreward/claim";
const LOGIN_URL = "https://www.aeropres.in/chromeapi/dawn/v1/auth/login";
const WITHDRAW_URL = "https://www.aeropres.in/chromeapi/dawn/v1/withdraw"; // Ubah jika ada URL withdraw
const TOKEN_FILE = "token.json";
const LOG_FILE = "bot_log.txt";

// Konfigurasi Retry & Delay
const retryDelay = [1, 2, 4, 8, 16, 32, 60];
const minDelay = 30;
const maxDelay = 90;
const autoWithdraw = true;
const withdrawThreshold = 1000;

let sessionToken = "";
let email = "";
let password = "";

// Fungsi Input dari User
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Fungsi Simpan Log
function logActivity(message) {
    const logMessage = `[${new Date().toLocaleString()}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(message);
}

// Fungsi Simpan Token
function saveToken(token) {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }));
}

// Fungsi Baca Token dari File
function loadToken() {
    if (fs.existsSync(TOKEN_FILE)) {
        return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")).token;
    }
    return null;
}

// Fungsi Login
async function login() {
    logActivity("🔑 Logging in...");
    try {
        const response = await axios.post(LOGIN_URL, { username: email, password: password });
        sessionToken = response.data.token;
        saveToken(sessionToken);
        logActivity("✅ Login sukses! Token diperbarui.");
    } catch (error) {
        logActivity("❌ Login gagal! " + (error.response?.data || error.message));
    }
}

// Fungsi Auto Claim
async function claimReward(attempt = 0) {
    if (attempt >= retryDelay.length) {
        logActivity("🚨 Gagal klaim setelah banyak percobaan.");
        return;
    }

    logActivity(`🎁 Mencoba klaim reward... (Percobaan ${attempt + 1})`);
    try {
        const response = await axios.post(API_URL, {}, { headers: { Authorization: `Bearer ${sessionToken}` } });
        logActivity("✅ Reward berhasil diklaim: " + JSON.stringify(response.data));

        if (autoWithdraw) {
            await withdrawIfNeeded();
        }
    } catch (error) {
        if (error.response?.status === 401) {
            logActivity("⚠️ Session expired, login ulang...");
            await login();
            return claimReward(attempt);
        }

        let delay = retryDelay[attempt] * 1000;
        logActivity(`⏳ Retry dalam ${retryDelay[attempt]} detik...`);
        setTimeout(() => claimReward(attempt + 1), delay);
    }
}

// Fungsi Auto Withdraw (Opsional)
async function withdrawIfNeeded() {
    try {
        const balanceResponse = await axios.get("https://www.aeropres.in/chromeapi/dawn/v1/user/balance", { headers: { Authorization: `Bearer ${sessionToken}` } });
        const balance = balanceResponse.data.balance;

        logActivity(`💰 Saldo saat ini: ${balance}`);

        if (balance >= withdrawThreshold) {
            logActivity("🔄 Menjalankan auto withdraw...");
            const response = await axios.post(WITHDRAW_URL, { amount: balance }, { headers: { Authorization: `Bearer ${sessionToken}` } });
            logActivity("✅ Withdraw berhasil: " + JSON.stringify(response.data));
        }
    } catch (error) {
        logActivity("❌ Gagal cek saldo atau withdraw: " + (error.response?.data || error.message));
    }
}

// Fungsi Menjalankan Bot
(async () => {
    email = await askQuestion("📩 Masukkan Email: ");
    password = await askQuestion("🔑 Masukkan Password: ");
    rl.close();

    sessionToken = loadToken();
    if (!sessionToken) {
        await login();
    }

    setInterval(() => {
        let delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        logActivity(`⏳ Menunggu ${delay} detik sebelum klaim berikutnya...`);
        setTimeout(() => claimReward(), delay * 1000);
    }, 60000);
})();
