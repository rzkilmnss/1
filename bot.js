const axios = require('axios');
const readline = require('readline-sync');

function getPoint(token) {
    const url = "https://www.aeropres.in/api/atom/v1/userreferral/getpoint?appid=678f02e10d5de18f98ffbe8e2c";
    
    axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
        }
    }).then(response => {
        console.log("\n✅ Response:", response.data);
    }).catch(error => {
        console.error("\n❌ Error:", error.response ? error.response.data : error.message);
    });
}

// Menu utama
console.log("\n=== Dawn Auto Claim Bot ===");
const token = readline.question("Masukkan Token Bearer: ");
console.log("\n1. Cek Poin");
console.log("2. Keluar");
const pilihan = readline.questionInt("Pilih menu: ");

if (pilihan === 1) {
    getPoint(token);
} else {
    console.log("Keluar...");
}
