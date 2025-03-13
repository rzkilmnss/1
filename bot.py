import requests
import time
import os

# Branding dan Menu Awal
def show_menu():
    os.system('clear' if os.name == 'posix' else 'cls')
    print("""
██████╗ ███████╗██╗  ██╗██╗██╗     ███╗   ██╗███╗   ██╗███████╗███████╗
██╔══██╗██╔════╝██║ ██╔╝██║██║     ████╗  ██║████╗  ██║██╔════╝██╔════╝
██║  ██║█████╗  █████╔╝ ██║██║     ██╔██╗ ██║██╔██╗ ██║███████╗█████╗  
██║  ██║██╔══╝  ██╔═██╗ ██║██║     ██║╚██╗██║██║╚██╗██║╚════██║██╔══╝  
██████╔╝███████╗██║  ██╗██║███████╗██║ ╚████║██║ ╚████║███████║███████╗
╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚══════╝
                                                                     
       🚀 Auto Mining Bot - rzkilmnss 🚀
    """)
    print("1. Mulai Auto Mining")
    print("2. Keluar")
    choice = input("Pilih opsi (1/2): ")
    return choice

# Input Token
def get_token():
    return input("\n🔑 Masukkan Token Bearer Anda: ")

# Konfigurasi API
BASE_URL = "https://api.dawn.org"

ENDPOINTS = {
    "points": f"{BASE_URL}/user/points",
    "mine_start": f"{BASE_URL}/mine/start",
    "mine_status": f"{BASE_URL}/mine/status",
}

# Fungsi mengambil total poin
def get_points(token):
    try:
        response = requests.get(ENDPOINTS["points"], headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            return response.json().get("points", "Tidak ditemukan")
        else:
            print(f"⚠️ Error saat mengambil poin: {response.text}")
            return None
    except Exception as e:
        print(f"⚠️ Error saat mengambil poin: {e}")
        return None

# Fungsi memulai mining
def start_mining(token):
    try:
        response = requests.post(ENDPOINTS["mine_start"], headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            return True
        else:
            print(f"⚠️ Error saat mining: {response.text}")
            return False
    except Exception as e:
        print(f"⚠️ Error saat mining: {e}")
        return False

# Fungsi utama menjalankan auto mining
def auto_mining(token):
    while True:
        points = get_points(token)
        if points is not None:
            print(f"\n💰 Total Poin: {points}")

        print("⚡ Bot auto mining dimulai...")
        success = start_mining(token)
        
        if success:
            print("✅ Mining berhasil!")
        else:
            print("❌ Mining gagal, mencoba lagi nanti...")

        print("⏳ Menunggu sebelum mining berikutnya...\n")
        time.sleep(60)  # Tunggu 60 detik sebelum mining ulang

# Program Utama
while True:
    choice = show_menu()
    if choice == "1":
        token = get_token()
        auto_mining(token)
    elif choice == "2":
        print("🚀 Keluar dari bot. Sampai jumpa!")
        break
    else:
        print("❌ Pilihan tidak valid. Coba lagi.")
