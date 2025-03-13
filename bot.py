import requests
import time
import os

# Warna untuk tampilan
RED = "\033[91m"
GREEN = "\033[92m"
CYAN = "\033[96m"
RESET = "\033[0m"

# Fungsi untuk membersihkan layar
def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")

# Fungsi untuk menampilkan banner ASCII keren
def show_banner():
    clear_screen()
    print(CYAN + """
██████╗ ███████╗██╗  ██╗██╗██╗     ███╗   ███╗███╗   ██╗███████╗███████╗
██╔══██╗██╔════╝██║  ██║██║██║     ████╗ ████║████╗  ██║██╔════╝██╔════╝
██║  ██║█████╗  ███████║██║██║     ██╔████╔██║██╔██╗ ██║███████╗█████╗  
██║  ██║██╔══╝  ██╔══██║██║██║     ██║╚██╔╝██║██║╚██╗██║╚════██║██╔══╝  
██████╔╝███████╗██║  ██║██║███████╗██║ ╚═╝ ██║██║ ╚████║███████║███████╗
╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
    """ + RESET)

# Fungsi untuk input token dari pengguna
def get_token():
    token = input("🔑 Masukkan Token Bearer: ")
    return token

# Fungsi untuk mengambil total poin
def get_points(token):
    url = "https://api.dawn.org/user/points"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data.get("points", 0)
        else:
            print(f"❌ Gagal mengambil poin: {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️ Error saat mengambil poin: {e}")
        return None

# Fungsi untuk memulai mining
def start_mining(token):
    url = "https://api.dawn.org/mine/start"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.post(url, headers=headers)
        if response.status_code == 200:
            print(GREEN + "✅ Mining berhasil!" + RESET)
        else:
            print(RED + f"❌ Gagal mining: {response.status_code}" + RESET)
    except Exception as e:
        print(f"⚠️ Error saat mining: {e}")

# Fungsi menu utama
def main_menu():
    while True:
        show_banner()
        print("1️⃣  Mulai Auto Mining")
        print("2️⃣  Keluar")
        choice = input("\nPilih menu: ")

        if choice == "1":
            token = get_token()
            start_bot(token)
        elif choice == "2":
            print("👋 Keluar dari bot. Sampai jumpa!")
            break
        else:
            print("⚠️ Pilihan tidak valid, coba lagi!")

# Fungsi untuk menjalankan bot mining
def start_bot(token):
    print("\n⚡ Bot auto mining dimulai...\n")
    while True:
        points = get_points(token)
        if points is not None:
            print(f"💰 Total Poin: {points}")

        start_mining(token)
        print("⏳ Menunggu sebelum mining berikutnya...\n")
        time.sleep(300)  # Menunggu 5 menit sebelum mining ulang

if __name__ == "__main__":
    main_menu()
