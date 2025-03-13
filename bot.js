const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const chalk = require("chalk");

// Konstanta API
const API_CLAIM = "https://www.aeropres.in/chromeapi/dawn/v1/userreward/claim";
const TOKEN_FILE = "token.json"; // File untuk menyimpan token
const LOG_FILE = "bot_log.txt"; // File untuk menyimpan log aktivitas

// Fungsi untuk membaca input dari user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

// Fungsi untuk menyimpan token ke file
function saveToken(token) {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }));
}

// Fungsi untuk memuat token dari file
function loadToken() {
    if (fs.existsSync(TOKEN_FILE)) {
        return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")).token;
    }
    return null;
}

// Fungsi untuk mencatat log aktivitas
function logActivity(message) {
    const logMessage = `[${new Date().toLocaleString()}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(message);
}

// Fungsi untuk klaim reward
async function claimReward() {
    let sessionToken = loadToken();
    if (!sessionToken) {
        console.log(chalk.red("❌ Token tidak ditemukan! Masukkan token terlebih dahulu."));
        return showMenu();
    }

    console.log(chalk.white("🎁 Mencoba klaim reward..."));
    try {
        const response = await axios.post(API_CLAIM, {}, {
            headers: { Authorization: `Bearer ${sessionToken}` }
        });

        logActivity(chalk.green("✅ Reward berhasil diklaim: " + JSON.stringify(response.data)));
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(chalk.red("⚠️ Token expired! Silakan masukkan token baru."));
            return inputToken();
        }

        logActivity(chalk.red("❌ Gagal klaim: " + (error.response?.data || error.message)));
    }

    setTimeout(claimReward, 60000); // Ulangi klaim setiap 60 detik
}

// Fungsi untuk input token manual
function inputToken() {
    rl.question(chalk.white("🔑 Masukkan Token Bearer: "), (token) => {
        saveToken(token);
        console.log(chalk.green("✅ Token disimpan!"));
        showMenu();
    });
}

// Fungsi untuk menampilkan menu
function showMenu() {
    console.clear();
    console.log(chalk.white(`
██████╗ ███████╗██╗  ██╗██╗███╗   ███╗███╗   ██╗███╗   ██╗███████╗███████╗
██╔══██╗██╔════╝██║  ██║██║████╗ ████║████╗  ██║████╗  ██║██╔════╝██╔════╝
██║  ██║█████╗  ███████║██║██╔████╔██║██╔██╗ ██║██╔██╗ ██║███████╗█████╗  
██║  ██║██╔══╝  ██╔══██║██║██║╚██╔╝██║██║╚██╗██║██║╚██╗██║╚════██║██╔══╝  
██████╔╝███████╗██║  ██║██║██║ ╚═╝ ██║██║ ╚████║██║ ╚████║███████║███████╗
╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚══════╝

📌 Bot By rzkilmnss
📜 Pilih Menu:
1️⃣ Start Auto Claim
2️⃣ Input/Edit Token
3️⃣ Keluar
`));

    rl.question(chalk.white("Pilih menu (1-3): "), (choice) => {
        if (choice === "1") {
            claimReward();
        } else if (choice === "2") {
            inputToken();
        } else if (choice === "3") {
            console.log(chalk.white("👋 Keluar..."));
            rl.close();
            process.exit();
        } else {
            console.log(chalk.red("❌ Pilihan tidak valid!"));
            showMenu();
        }
    });
}

// Jalankan Menu Awal
showMenu();
