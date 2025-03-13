const axios = require("axios");
const readline = require("readline");

const API_URL = "https://www.aeropres.in/chromeapi/dawn/v1/userreward/claim";
const LOGIN_URL = "https://www.aeropres.in/chromeapi/dawn/v1/auth/login";
let sessionToken = "";

// Membuat interface input dari terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fungsi untuk menampilkan teks putih
function putih(teks) {
    return `\x1b[37m${teks}\x1b[0m`;
}

// Fungsi Login dari Menu
async function login() {
    return new Promise((resolve) => {
        rl.question(putih("📧 Masukkan Email: "), (email) => {
            rl.question(putih("🔒 Masukkan Password: "), async (password) => {
                console.log(putih("🔑 Sedang login..."));
                try {
                    const response = await axios.post(LOGIN_URL, { username: email, password: password });
                    sessionToken = response.data.token;
                    console.log(putih("✅ Login sukses!\n"));
                    resolve(true);
                } catch (error) {
                    console.log(putih("❌ Login gagal! Periksa kembali email/password.\n"));
                    resolve(false);
                }
            });
        });
    });
}

// Fungsi Auto Claim
async function claimReward() {
    console.log(putih("🎁 Mencoba klaim reward..."));
    try {
        const response = await axios.post(API_URL, {}, { headers: { Authorization: `Bearer ${sessionToken}` } });
        console.log(putih(`✅ Reward berhasil diklaim! Point sekarang: ${response.data.point}\n`));
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(putih("⚠️ Session expired, silakan login ulang.\n"));
        } else {
            console.log(putih("❌ Gagal klaim reward, coba lagi nanti.\n"));
        }
    }
}

// Fungsi Menu
async function showMenu() {
    console.clear();
    console.log(putih(`
██████╗  █████╗ ██╗    ██╗███╗   ██╗███╗   ██╗███████╗███████╗
██╔══██╗██╔══██╗██║    ██║████╗  ██║████╗  ██║██╔════╝██╔════╝
██████╔╝███████║██║ █╗ ██║██╔██╗ ██║██╔██╗ ██║███████╗███████╗
██╔═══╝ ██╔══██║██║███╗██║██║╚██╗██║██║╚██╗██║╚════██║╚════██║
██║     ██║  ██║╚███╔███╔╝██║ ╚████║██║ ╚████║███████║███████║
╚═╝     ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚══════╝
    
📌 Bot By rzkilmnss
────────────────────────────────
📜 Menu Pilihan:
1️⃣ Start Auto Claim
2️⃣ Keluar
────────────────────────────────
`));

    rl.question(putih("Pilih menu (1-2): "), async (choice) => {
        if (choice === "1") {
            await claimReward();
            setInterval(() => claimReward(), 60000); // Auto Claim setiap 60 detik
        } else {
            console.log(putih("👋 Keluar..."));
            rl.close();
        }
    });
}

// Jalankan Program
(async () => {
    const isLoggedIn = await login();
    if (isLoggedIn) {
        showMenu();
    } else {
        console.log(putih("⚠️ Bot berhenti karena login gagal.\n"));
        rl.close();
    }
})();
