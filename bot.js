const axios = require('axios');

async function getDawnPoints() {
    try {
        const response = await axios.get('https://www.aeropres.in/api/atom/v1/userreferral/getpoint?appid=678f02e10d5de18f98ffbe8e2c', {
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
                'Authorization': 'Bearer 260b27bd0a3eb2b6d2fd430c797a0da7f6127fa1261f54b618ca30d7951749169b87450874057',
                'Content-Type': 'application/json',
                'Sec-Ch-Ua': '"Not A;Brand";v="8", "Chromium";v="121"',
                'Sec-Ch-Ua-Mobile': '?1',
                'Sec-Ch-Ua-Platform': '"Android"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site'
            }
        });

        console.log('Data Points:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Jalankan fungsi
getDawnPoints();
