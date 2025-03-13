const axios = require('axios');
const readline = require('readline');

// Membuat interface untuk input terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fungsi untuk mendapatkan total poin
async function getTotalPoints(token) {
    try {
        const response = await axios.get('https://www.aeropres.in/api/atom/v1/userreferral/getpoint', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 9)',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.aeropres.in/',
                'Origin': 'https://www.aeropres.in'
            }
        });

        return response.data.total_points || 'Tidak diketahui';
    } catch (error) {
        console.log(`❌ Gagal mengambil poin: ${error.response ? error.response.status : error.message}`);
        return 'Error';
    }
}

// Fungsi untuk menjalankan auto mining (dummy function)
async function startAutoMining(token) {
    console.log('⚡ Bot auto mining dimulai...');

    while (true) {
        try {
            const response = await axios.post('https://www.aeropres.in/api/atom/v1/mining/start', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 9)',
                    'Accept': 'application/json, text/plain, */*',
                    'Referer': 'https://www.aeropres.in/',
                    'Origin': 'https://www.aeropres.in'
                }
            });

            console.log(`✅ Mining berhasil!`);
        } catch (error) {
            console.log(`❌ Gagal mining: ${error.response ? error.response.status : error.message}`);
        }

        console.log('⏳ Menunggu sebelum mining berikutnya...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Delay 60 detik
    }
}

// Mulai program dengan meminta input token
rl.question('🔑 Masukkan token Bearer: ', async (token) => {
    console.log('🔍 Mengambil total poin...');
    const points = await getTotalPoints(token);
    console.log(`💰 Total Poin: ${points}`);

    // Memulai auto mining
    await startAutoMining(token);
});
