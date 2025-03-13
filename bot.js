const axios = require('axios');
const readline = require('readline');
const fs = require('fs');

// Fungsi untuk membaca akun dari file accounts.txt
function readAccounts() {
    const accounts = fs.readFileSync('accounts.txt', 'utf-8').trim().split('\n');
    return accounts.map(line => {
        const [email, token] = line.split(':');
        return { email, token };
    });
}

// Fungsi mengambil total poin
async function getPoints(email, token) {
    try {
        const response = await axios.get('https://api.dawn.org/points', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        return response.data.points || 0;
    } catch (error) {
        console.log(`❌ Gagal mengambil poin untuk ${email}: ${error.response?.status || error.message}`);
        return null;
    }
}

// Fungsi untuk mining
async function mine(email, token) {
    try {
        const response = await axios.post('https://api.dawn.org/mine', {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        console.log(`✔️ Mining berhasil untuk ${email}`);
        return true;
    } catch (error) {
        console.log(`❌ Gagal mining untuk ${email}: ${error.response?.status || error.message}`);
        return false;
    }
}

// Fungsi utama
async function main() {
    console.log("⚡ Bot auto mining dimulai...");

    const accounts = readAccounts();

    while (true) {
        for (const { email, token } of accounts) {
            const points = await getPoints(email, token);
            if (points !== null) {
                console.log(`💰 Total Poin untuk ${email}: ${points}`);
            }

            const success = await mine(email, token);
            if (!success) {
                console.log(`❌ Mining gagal untuk ${email}, akan dicoba lagi nanti.`);
            }

            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (30000 - 10000 + 1) + 10000))); // Delay random 10-30 detik
        }

        console.log("⏳ Menunggu sebelum siklus berikutnya...");
        await new Promise(resolve => setTimeout(resolve, 500000)); // Delay 500 detik sebelum ulang mining
    }
}

// Jalankan bot
main();
