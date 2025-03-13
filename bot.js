const axios = require('axios');
const fs = require('fs');
const readline = require('readline-sync');

// Input token
const token = readline.question("Masukkan Token Bearer: ");

// Fungsi untuk mencatat log
function logActivity(message) {
    const logMessage = `[${new Date().toLocaleString()}] ${message}\n`;
    fs.appendFileSync('log.txt', logMessage);
}

// Fungsi untuk mendapatkan total poin
async function getTotalPoints() {
    try {
        const response = await axios.get('https://www.aeropres.in/api/atom/v1/userreferral/getpoint', {
            headers: {
                'Authorization': token,
                'User-Agent': 'Mozilla/5.0 (Android 9; Mobile)',
            }
        });

        if (response.data.success) {
            return response.data.data.total_points || 0;
        } else {
            return "Gagal mengambil poin!";
        }
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

// Fungsi untuk memulai mining
async function startMining() {
    console.log("\n⚡ Bot auto mining dimulai...\n");

    while (true) {
        try {
            // Cek total poin sebelum mining
            const totalPoints = await getTotalPoints();
            console.log(`💰 Total Poin: ${totalPoints}`);
            logActivity(`Total Poin: ${totalPoints}`);

            // Proses mining (misalnya dengan API yang sesuai)
            const response = await axios.get('https://www.aeropres.in/api/atom/v1/userreferral/getpoint', {
                headers: {
                    'Authorization': token,
                    'User-Agent': 'Mozilla/5.0 (Android 9; Mobile)',
                }
            });

            if (response.data.success) {
                console.log(`✅ Mining sukses!`);
                logActivity("Mining sukses!");
            } else {
                console.log(`❌ Gagal mining: ${response.data.message}`);
                logActivity(`Gagal mining: ${response.data.message}`);
            }
        } catch (error) {
            console.log(`⚠️ Error: ${error.message}`);
            logActivity(`Error: ${error.message}`);
        }

        // Tunggu sebelum mencoba lagi (1 menit)
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
}

// Jalankan bot
startMining();
