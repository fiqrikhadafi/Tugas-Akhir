# Panduan Hosting Frontend ke Vercel

Panduan ini khusus untuk frontend React/Vite pada folder `frontend`.

## 1. File yang sudah disiapkan

Frontend sudah memakai environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Nilai ini dipakai untuk memanggil Flask backend dan URL gambar dari backend.

File `vercel.json` juga sudah ditambahkan agar route React seperti `/dashboard`, `/history`, dan `/trend` tetap bisa dibuka langsung atau di-refresh pada Vercel.

## 2. Uji build lokal

Jalankan dari folder `frontend`:

```bash
npm install
npm run build
```

Jika berhasil, Vite akan membuat folder `dist`.

## 3. Push project ke GitHub

Pastikan yang di-push adalah repo utama yang berisi folder:

```text
frontend/
sistem_pendeteksi_gajah/
```

Jangan push folder `frontend/node_modules` dan `frontend/dist`; keduanya sudah diabaikan oleh `.gitignore`.

## 4. Import project di Vercel

1. Buka `https://vercel.com`.
2. Login dengan GitHub.
3. Pilih `Add New...`.
4. Pilih `Project`.
5. Pilih repository project ini.
6. Pada pengaturan import, isi:

```text
Framework Preset : Vite
Root Directory   : frontend
Build Command    : npm run build
Output Directory : dist
Install Command  : npm install
```

## 5. Tambahkan Environment Variable

Pada halaman import atau Project Settings, buka bagian Environment Variables.

Untuk mode lokal awal, jika backend Flask belum punya URL publik, isi sementara:

```text
Name  : VITE_API_BASE_URL
Value : http://localhost:5000
```

Catatan: nilai `localhost` hanya berguna ketika website dibuka di komputer yang sama dengan backend. Untuk website Vercel yang ingin dibuka dari HP/jaringan lain, backend harus memakai URL publik HTTPS, misalnya dari Cloudflare Tunnel atau ngrok.

Jika backend sudah punya URL publik, isi:

```text
Name  : VITE_API_BASE_URL
Value : https://alamat-backend-publik-anda
```

Contoh:

```text
VITE_API_BASE_URL=https://pendeteksi-gajah.trycloudflare.com
```

## 6. Deploy

Klik `Deploy`.

Setelah selesai, Vercel akan memberi URL seperti:

```text
https://nama-project.vercel.app
```

## 7. Test setelah deploy

1. Buka URL Vercel.
2. Login seperti biasa.
3. Masuk ke `/dashboard`.
4. Refresh halaman dashboard.
5. Buka `/history`.
6. Pastikan tidak 404.
7. Jika backend belum online, data dashboard wajar belum muncul.
8. Jika backend sudah online, cek Network tab browser dan pastikan request mengarah ke `VITE_API_BASE_URL`.

## 8. Jika mengganti alamat backend

1. Buka Vercel Dashboard.
2. Masuk ke project.
3. Buka `Settings`.
4. Buka `Environment Variables`.
5. Ubah `VITE_API_BASE_URL`.
6. Redeploy project.

Perubahan environment variable Vercel hanya berlaku untuk deployment baru.

