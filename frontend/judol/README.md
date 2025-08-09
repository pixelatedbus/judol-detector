# JudolDetector88
Ini adalah aplikasi web full-stack yang dirancang untuk menganalisis dan memoderasi komentar di video YouTube. Aplikasi ini memungkinkan pengguna untuk mencari komentar yang mengandung pola tertentu menggunakan berbagai algoritma pencocokan string dan menyediakan alat bagi pengguna yang terautentikasi untuk mengelola komentar di video mereka sendiri.

## Fitur
Pencarian Komentar: Mengambil semua komentar dan balasan dari URL atau ID video YouTube yang diberikan.

Pencocokan String Tingkat Lanjut: Pengguna dapat memilih di antara beberapa algoritma untuk menemukan komentar:

Regex: Mencari pola yang sudah ditentukan (contoh: kata77, kata88).

KMP, Boyer-Moore, Rabin-Karp: Mencari pola yang diberikan oleh pengguna dalam file .txt.

Normalisasi Unicode: Secara otomatis menormalkan karakter Unicode khusus dalam komentar menjadi teks standar untuk pencarian yang lebih efektif.

Autentikasi Google: Pengguna dapat masuk dengan akun Google mereka menggunakan Passport.js untuk mengakses fitur moderasi.

Posting Komentar Massal: Pengguna yang terautentikasi dapat mengunggah file .txt (dengan komentar dipisahkan oleh titik koma) untuk memposting beberapa komentar di sebuah video.

Penghapusan Komentar: Pengguna yang terautentikasi dapat menghapus komentar individual atau semua komentar spam yang ditemukan dari video mereka sendiri.

## Teknologi yang Digunakan
- Frontend Framework: Next.js (React)

- Backend Framework: Express.js

- Autentikasi: Passport.js dengan Google OAuth 2.0

- Manajemen Sesi: express-session

- Node.js

- npm

- Proyek Google Cloud dengan YouTube Data API v3 yang diaktifkan dan kredensial OAuth 2.0.

## 1. Clone Repositori
```
git clone https://github.com/pixelatedbus/judol-detector
cd judol-detector
```

## 2. Instalasi Dependensi
Instal dependensi untuk backend dan frontend.

### Instal dependensi backend
```
cd backend
npm install
```

### Instal dependensi frontend
```
cd ../frontend/judol
npm install
```

## 3. Pengaturan Variabel Lingkungan
Anda akan memerlukan dua file .env.

```backend/.env:```

```
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
SESSION_SECRET=a_very_long_random_string
API_KEY=your_youtube_api_key
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/google/redirect
CLIENT_HOME_PAGE_URL=http://localhost:3001
```

(Google OAuth2 perlu dikonfigurasi ulang untuk dijalankan di sistem lokal.)
```
frontend/judol/.env.local:
```
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```
## 4. Menjalankan Aplikasi
Buka dua terminal terpisah.

### Terminal 1 (Backend):
```
cd backend
npm start
```
### Terminal 2 (Frontend):
```
cd frontend/judol
npm run dev
```
Backend akan berjalan di http://localhost:3000.

Frontend akan berjalan di http://localhost:3001.

Deployment
Proyek ini dikonfigurasi untuk deployment terpisah:

Frontend di-deploy di Vercel: https://judol-detector-eight.vercel.app/

Backend di-deploy di Railway: https://judol-detector-firefly.up.railway.app/