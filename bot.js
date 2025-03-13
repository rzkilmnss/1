const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');

// Konstanta API
const API_URL = "https://www.aeropres.in/chromeapi/dawn/v1/userreward/claim";
const LOGIN_URL = "https://www.aeropres.in/chromeapi/dawn/v1/auth/login";
const WITHDRAW_URL = "https://www.aeropres.in/chromeapi/dawn/v1/withdraw";
const BALANCE_URL = "https://www.aeropres.in/chromeapi/dawn/v1/user/balance";

const TOKEN_FILE = "token.json";
const LOG_FILE = "bot_log.txt";

// Konfigurasi
const retryDelay = [1, 2, 4, 8, 16, 32, 60]; 
const minDelay = 30;
const maxDelay = 90;
const autoWithdraw = true;
const withdrawThreshold = 1000;

let sessionToken = "";

// Fungsi Simpan Log
function logActivity(message) {
    const logMessage = `[${new Date().toLocaleString()}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(chalk.greenBright(message));
}

// Fungsi Simpan Token
function saveToken(token) {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }));
}

// Fungsi Baca Token dari File
function loadToken() {
    return fs.existsSync(TOKEN_FILE) ? JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")).token : null;
}

// Fungsi Login
async function login() {
    logActivity(chalk.yellow("🔑 Logging in..."));
    try {
        const response = await axios.post(LOGIN_URL, { username: "emailkamu@gmail.com", password: "passwordkamu" });
        sessionToken = response.data.token;
        saveToken(sessionToken);
        logActivity(chalk.green("✅ Login sukses! Token diperbarui."));
    } catch (error) {
        logActivity(chalk.red("❌ Login gagal! " + (error.response?.data || error.message)));
    }
}

// Fungsi Auto Claim dengan Retry
async function claimReward(attempt = 0) {
    if (attempt >= retryDelay.length) {
        logActivity(chalk.red("🚨 Gagal klaim setelah banyak percobaan."));
        return;
    }

    logActivity(chalk.blue(`🎁 Mencoba klaim reward... (Percobaan ${attempt + 1})`));
    try {
        const response = await axios.post(API_URL, {}, { headers: { Authorization: `Bearer ${sessionToken}` } });
        logActivity(chalk.green("✅ Reward berhasil diklaim: " + JSON.stringify(response.data)));

        if (autoWithdraw) {
            await withdrawIfNeeded();
        }
    } catch (error) {
        if (error.response?.status === 401) {
            logActivity(chalk.yellow("⚠️ Session expired, login ulang..."));
            await login();
            return claimReward(attempt);
        }

        let delay = retryDelay[attempt] * 1000;
        logActivity(chalk.yellow(`⏳ Retry dalam ${retryDelay[attempt]} detik...`));
        setTimeout(() => claimReward(attempt + 1), delay);
    }
}

// Fungsi Auto Withdraw
async function withdrawIfNeeded() {
    try {
        const balanceResponse = await axios.get(BALANCE_URL, { headers: { Authorization: `Bearer ${sessionToken}` } });
        const balance = balanceResponse.data.balance;

        logActivity(chalk.cyan(`💰 Saldo saat ini: ${balance}`));

        if (balance >= withdrawThreshold) {
            logActivity(chalk.magenta("🔄 Menjalankan auto withdraw..."));
            const response = await axios.post(WITHDRAW_URL, { amount: balance }, { headers: { Authorization: `Bearer ${sessionToken}` } });
            logActivity(chalk.green("✅ Withdraw berhasil: " + JSON.stringify(response.data)));
        }
    } catch (error) {
        logActivity(chalk.red("❌ Gagal cek saldo atau withdraw: " + (error.response?.data || error.message)));
    }
}

// Fungsi Cek Saldo
async function checkBalance() {
    try {
        const balanceResponse = await axios.get(BALANCE_URL, { headers: { Authorization: `Bearer ${sessionToken}` } });
        const balance = balanceResponse.data.balance;
        logActivity(chalk.cyan(`💰 Saldo saat ini: ${balance}`));
    } catch (error) {
        logActivity(chalk.red("❌ Gagal cek saldo: " + (error.response?.data || error.message)));
    }
}

// Fungsi Tampilkan Menu
function showMenu() {
    figlet("rzkilmnss", function(err, data) {
        if (err) {
            console.log("Gagal menampilkan logo.");
        } else {
            console.log(chalk.blueBright(data));
        }

        console.log(chalk.bold.greenBright(`
        📌 **Bot By rzkilmnss**

        📜 **Menu Pilihan:**
        1️⃣ Start Auto Claim
        2️⃣ Auto Withdraw
        3️⃣ Cek Saldo
        4️⃣ Keluar
        `));

        rl.question(chalk.yellow("Pilih menu (1-4): "), async (choice) => {
            switch (choice) {
                case "1":
                    await claimReward();
                    break;
                case "2":
                    await withdrawIfNeeded();
                    break;
                case "3":
                    await checkBalance();
                    break;
                case "4":
                    console.log(chalk.red("👋 Keluar..."));
                    rl.close();
                    process.exit(0);
                    break;
                default:
                    console.log(chalk.red("❌ Pilihan tidak valid! Coba lagi."));
            }
            setTimeout(showMenu, 2000); // Kembali ke menu setelah selesai
        });
    });
}

// Inisialisasi readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Jalankan Bot
(async () => {
    sessionToken = loadToken();
    if (!sessionToken) {
        await login();
    }
    showMenu();
})();
