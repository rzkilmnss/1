const axios = require("axios");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Masukkan Bearer Token: ", async (token) => {
    rl.close();

    const headers = { Authorization: `Bearer ${token}` };

    async function getPoints() {
        try {
            const res = await axios.get("https://api.dawn.com/points", { headers });
            return res.data.total_points;
        } catch (err) {
            console.error("Gagal mengambil poin:", err.response ? err.response.data : err.message);
            return null;
        }
    }

    async function claimReward() {
        try {
            const res = await axios.post("https://api.dawn.com/claim", {}, { headers });
            console.log("✅ Klaim sukses:", res.data.message);
        } catch (err) {
            console.error("❌ Klaim gagal:", err.response ? err.response.data : err.message);
        }
    }

    console.log("\n🔄 Mengambil total poin...");
    const initialPoints = await getPoints();
    if (initialPoints !== null) {
        console.log(`💰 Total Poin Sebelum Klaim: ${initialPoints}`);
    }

    console.log("\n⚡ Memulai auto claim...");
    await claimReward();

    console.log("\n🔄 Memeriksa total poin terbaru...");
    const finalPoints = await getPoints();
    if (finalPoints !== null) {
        console.log(`🎉 Total Poin Setelah Klaim: ${finalPoints}`);
    }

    console.log("\n✅ Bot selesai!");
});
