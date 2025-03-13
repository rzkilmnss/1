const axios = require("axios");
const fs = require("fs");
const readline = require("readline");

// Konstanta API
const API_URL = "https://www.aeropres.in/chromeapi/dawn/v1/userreward/claim";
const LOGIN_URL = "https://www.aeropres.in/chromeapi/dawn/v1/auth/login";
const WITHDRAW_URL = "https://www.aeropres.in/chromeapi/dawn/v1/withdraw";
const BALANCE_URL = "https://www.aeropres.in/chromeapi/dawn/v1/user/balance";
const TOKEN_FILE = "token.json";
const LOG_FILE = "bot_log.txt";

// Konfigurasi
let sessionToken = "";
const retryDelay = [1, 2, 4, 8, 16, 32, 60];
const minDelay = 30;
const maxDelay = 90;
const autoWithdraw = true;
const withdrawThreshold = 1000;

// Fungsi untuk menampilkan menu
async function showMenu() {
    console.clear();
    console.log(`
    ██████╗  █████╗ ██╗    ██╗███╗   ██╗███╗   ██╗███╗   ██╗███████╗███████╗
    ██╔══██╗██╔══██╗██║    ██║████╗  ██║████╗  ██║████╗  ██║██╔════╝██╔════╝
    ██████╔╝███████║██║ █╗ ██║██╔██╗ ██║██╔██╗ ██║██╔██╗ ██║█████╗  █████╗  
    ██╔═══╝ ██╔══██║██║███╗██║██║╚██╗██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══╝  
    ██║     ██║  ██║╚███╔███╔╝██║ ╚████║██║ ╚████║██║ ╚████║███████╗███████╗
    ╚═╝     ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚══════╝
    `);
    console.log("📌 **Bot By rzkilmnss**");
    console.log("\n📜 **Menu Pilihan:**");
    console.log("1️⃣ Start Auto Claim");
    console.log("2️⃣ Auto Withdraw");
    console.log("3️⃣ Cek Saldo");
    console.log("4️⃣ Keluar");
    console.log("");

    const choice = await userInput("Pilih menu (1-4): ");
    return choice;
}

// Fungsi untuk membaca input user
function userInput(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
    }));
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

// Fungsi untuk mendapatkan User-Agent acak
function getRandomUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Mozilla/5.0 (Linux; Android 10; SM-G973F)",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)"
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Fungsi Login
async function login() {
    logActivity("🔑 Logging in...");
    try {
        const response = await axios.post(LOGIN_URL, { username: "emailkamu@gmail.com", password: "passwordkamu" });
        sessionToken = response.data.token;
        saveToken(sessionToken);
        logActivity("✅ Login sukses! Token diperbarui.");
    } catch (error) {
        logActivity("❌ Login gagal! " + (error.response?.data || error.message));
    }
}

// Fungsi Auto Claim dengan Mode Stealth
async function claimReward(attempt = 0) {
    if (attempt >= retryDelay.length) {
        logActivity("🚨 Gagal klaim setelah banyak percobaan.");
        return;
    }

    logActivity(`🎁 Mencoba klaim reward... (Percobaan ${attempt + 1})`);
    try {
        const response = await axios.post(API_URL, {}, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
                "User-Agent": getRandomUserAgent()
            }
        });
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
        const balanceResponse = await axios.get(BALANCE_URL, { headers: { Authorization: `Bearer ${sessionToken}` } });
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

// Fungsi untuk cek saldo
async function checkBalance() {
    try {
        const response = await axios.get(BALANCE_URL, { headers: { Authorization: `Bearer ${sessionToken}` } });
        logActivity(`💰 Saldo Anda: ${response.data.balance}`);
    } catch (error) {
        logActivity("❌ Gagal cek saldo: " + (error.response?.data || error.message));
    }
}

// Jalankan Bot
(async () => {
    sessionToken = loadToken();
    if (!sessionToken) {
        await login();
    }

    while (true) {
        const menuChoice = await showMenu();
        if (menuChoice === "1") {
            logActivity("🚀 Memulai Auto Claim...");
            setInterval(() => claimReward(), 60000);
        } else if (menuChoice === "2") {
            await withdrawIfNeeded();
        } else if (menuChoice === "3") {
            await checkBalance();
        } else if (menuChoice === "4") {
            console.log("👋 Keluar...");
            process.exit();
        }
    }
})();
