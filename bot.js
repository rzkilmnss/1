const axios = require("axios");
const readline = require("readline-sync");

const LOGIN_URL = "https://www.aeropres.in/chromeapi/dawn/v1/auth/login";
let sessionToken = "";

// Fungsi untuk teks berwarna putih
function putih(teks) {
    return `\x1b[37m${teks}\x1b[0m`;
}

// Fungsi untuk menampilkan menu utama
function showMenu() {
    console.clear();
    console.log(putih(`
    ██████╗ ███████╗██╗  ██╗██╗███╗   ███╗███╗   ██╗██╗   ██╗███████╗███████╗
    ██╔══██╗██╔════╝██║  ██║██║████╗ ████║████╗  ██║██║   ██║██╔════╝██╔════╝
    ██║  ██║█████╗  ███████║██║██╔████╔██║██╔██╗ ██║██║   ██║███████╗█████╗  
    ██║  ██║██╔══╝  ██╔══██║██║██║╚██╔╝██║██║╚██╗██║╚██╗ ██╔╝╚════██║██╔══╝  
    ██████╔╝███████╗██║  ██║██║██║ ╚═╝ ██║██║ ╚████║ ╚████╔╝ ███████║███████╗
    ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚══════╝╚══════╝
    
    📌 Bot By rzkilmnss
    `));

    console.log(putih(`
    📜 MENU PILIHAN:
    1️⃣ Start Auto Claim
    2️⃣ Keluar
    `));
}

// Fungsi Login
async function login() {
    console.log(putih("📧 Masukkan Email:"));
    const email = readline.question(putih("> "));

    console.log(putih("🔒 Masukkan Password:"));
    const password = readline.question(putih("> "), { hideEchoBack: true });

    console.log(putih("🔑 Sedang login..."));

    try {
        const response = await axios.post(LOGIN_URL, { username: email, password: password }, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "application/json"
            }
        });

        sessionToken = response.data.token;
        console.log(putih("\n✅ Login sukses!\n"));
        return true;
    } catch (error) {
        console.log(putih(`❌ Login gagal! ${error.response?.data?.message || error.message}\n`));
        return false;
    }
}

// Jalankan Program
(async () => {
    showMenu();
    const pilihan = readline.question(putih("Pilih menu (1-2): "));

    if (pilihan === "1") {
        const isLoggedIn = await login();
        if (isLoggedIn) {
            console.log(putih("🚀 Mulai auto claim...\n"));
        } else {
            console.log(putih("⚠️ Bot berhenti karena login gagal.\n"));
        }
    } else {
        console.log(putih("👋 Keluar..."));
        process.exit();
    }
})();
