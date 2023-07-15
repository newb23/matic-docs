---
id: validator-hosting
title: Hosting Validator
description: "Persyaratan hosting untuk Polygon Edge"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Di bawah ini adalah saran untuk mengehos node validasi dengan baik di jaringan Polygon Edge. Harap perhatikan semua item yang tercantum di bawah ini dengan saksama untuk memastikan
bahwa pengaturan validator dikonfigurasi dengan benar agar aman, stabil, dan berfungsi dengan baik.

## Dasar pengetahuan {#knowledge-base}

Sebelum mencoba menjalankan node validasi, baca dokumen ini sampai selesai dengan cermat.   
Dokumen tambahan yang mungkin membantu adalah:

- [Instalasi](get-started/installation)
- [Pengaturan cloud](get-started/set-up-ibft-on-the-cloud)
- [Perintah CLI](get-started/cli-commands)
- [File konfigurasi server](configuration/sample-config)
- [Kunci privat](configuration/manage-private-keys)
- [Metrik Prometheus](configuration/prometheus-metrics)
- [Pengelola rahasia](/docs/category/secret-managers)
- [Cadangan/Pemulihan](working-with-node/backup-restore)

## Persyaratan sistem minimum {#minimum-system-requirements}

| Tipe | Nilai | Dipengaruhi oleh |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 core | <ul><li>Jumlah kueri JSON-RPC</li><li>Ukuran kondisi blockchain</li><li>Batas gas blok</li><li>Waktu blok</li></ul> |
| RAM | 2 GB | <ul><li>Jumlah kueri JSON-RPC</li><li>Ukuran kondisi blockchain</li><li>Batas gas blok</li></ul> |
| Diska | <ul><li>Partisi root 10 GB</li><li>Partisi root 30 GB dengan LVM untuk ekstensi diska</li></ul> | <ul><li>Ukuran kondisi blockchain</li></ul> |


## Konfigurasi layanan {#service-configuration}

Biner `polygon-edge` harus dijalankan sebagai layanan sistem secara otomatis pada konektivitas jaringan yang telah ditetapkan dan memiliki fungsi mulai / berhenti /
mulai ulang. Sebaiknya, gunakan manajer layanan seperti `systemd.`

Contoh file konfigurasi sistem `systemd`:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Biner {#binary}

Dalam beban kerja produksi, biner `polygon-edge` harus boleh disebarkan dari biner rilis GitHub pre-built - bukan mengompilasi secara manual.
:::info

Dengan melakukan kompilasi cabang GitHub `develop` secara manual, Anda dapat memperkenalkan perubahan yang dapat menyebabkan kerusakan pada lingkungan Anda.   
Untuk itu, sebaiknya sbarkan biner Polygon Edge hanya dari rilisnya, karena akan mengandung
informasi tentang perubahan yang dapat menyebabkan kerusakan dan cara mengatasinya.

:::

Silakan lihat [Instalasi](/docs/edge/get-started/installation) untuk mendapatkan ikhtisar lengkap tentang metode instalasi.

### Penyimpanan data {#data-storage}

Folder `data/` yang berisi seluruh kondisi blockchain harus dimuat pada diska/volume khusus yang memungkinkan untuk
pencadangan diska otomatis, perluasan volume, dan opsi pemuatan diska/volume ke instans yang lain jika terjadi kegagalan.


### File log {#log-files}

File log harus dirotasi setiap hari (dengan alat seperti `logrotate`).
:::warning

Jika dikonfigurasi tanpa rotasi log, maka file log dapat menggunakan semua ruang diska yang tersedia dan dapat mengganggu waktu aktif validator.

:::

Contoh konfigurasi `logrotate`:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Silakan lihat bagian [Pembuatan Log](#logging) di bawah ini untuk saran tentang penyimpanan log.

### Dependensi tambahan {#additional-dependencies}

`polygon-edge` dikompilasi secara statis dan tidak memerlukan dependensi OS host tambahan.

## Pemeliharaan {#maintenance}

Di bawah ini adalah praktik terbaik untuk melakukan pemeliharaan node validator aktif di jaringan Polygon Edge.

### Cadangan {#backup}

Ada dua jenis prosedur pencadangan yang direkomendasikan untuk node Polygon Edge.

Anjurannya adalah menggunakan keduanya, jika memungkinkan, dengan cadangan Polygon Edge yang selalu menjadi pilihan yang tersedia.

* ***Cadangan volume***:    
  Pencadangan tambahan harian volume `data/` node Polygon Edge atau VM lengkap, jika memungkinkan.


* ***Pencadangan Polygon Edge***:    
  Sebaiknya gunakan tugas CRON harian yang melakukan pencadangan Polygon Edge secara reguler dan memindahkan file `.dat` ke lokasi di luar komputer atau ke penyimpanan objek cloud yang aman.

Idealnya, cadangan Polygon Edge tidak boleh tumpang tindih dengan cadangan volume yang dijelaskan di atas.

Silakan lihat [Mencadangkan/memulihkan instans node](working-with-node/backup-restore) untuk mendapatkan petunjuk tentang cara melakukan pencadangan Polygon Edge.

### Pembuatan Log {#logging}

Log yang dihasilkan oleh node Polygon Edge harus:
- dikirim ke penyimpanan data eksternal dengan kemampuan pengindeksan dan pencarian
- memiliki periode penyimpanan log selama 30 hari

Jika ini kali pertama Anda menyiapkan validator Polygon Edge, sebaiknya mulai node
dengan opsi `--log-level=DEBUG` untuk dapat melakukan debug dengan cepat atas setiap masalah yang mungkin dihadapi.

:::info

`--log-level=DEBUG` akan membuat keluaran log node ini seringkas mungkin.   
Log debug akan secara drastis meningkatkan ukuran file log yang harus dipertimbangkan ketika menyiapkan
solusi rotasi log.

:::
### Patch keamanan OS {#os-security-patches}

Administrator harus memastikan bahwa instans validator OS selalu diperbarui dengan patch terbaru setidaknya sekali setiap bulan.

## Metrik {#metrics}

### Metrik sistem {#system-metrics}

Administrator harus menyiapkan semacam monitor metrik sistem (misalnya Telegraf + InfluxDB + Grafana atau SaaS pihak ke-3).

Metrik yang perlu dipantau dan memiliki pengaturan pemberitahuan peringatan:

| Nama Metrik | Ambang alarm |
|-----------------------|-------------------------------|
| Penggunaan CPU (%) | > 90% untuk lebih dari 5 menit |
| Pemanfaatan RAM (%) | > 90% untuk lebih dari 5 menit |
| Pemanfaatan diska root | > 90% |
| Pemanfaatan diska data | > 90% |

### Metrik Validator {#validator-metrics}

Administrator harus menyiapkan koleksi metrik dari API Prometheus Polygon Edge agar dapat
memantau performa blockchain.

Silakan lihat [metrik Prometheus](configuration/prometheus-metrics) untuk memahami metrik mana yang sedang diekspos dan cara untuk menyiapkan koleksi metrik Prometheus.


Perhatian ekstra harus diberikan pada metrik berikut:
- ***Waktu produksi blok*** - Jika waktu produksi blok lebih tinggi dari biasanya, ada kemungkinan terjadi masalah dengan jaringan
- ***Jumlah putaran konsensus*** - jika ada lebih dari 1 putaran, ada kemungkinan masalah dengan validator yang ditetapkan pada jaringan
- ***Jumlah peer*** - jika jumlah peer menurun, artinya ada masalah konektivitas dalam jaringan

## Keamanan {#security}

Di bawah ini adalah praktik terbaik untuk mengamankan node validator aktif d jaringan Polygon Edge.

### Layanan API {#api-services}

- ***JSON-RPC***
Hanya layanan API yang perlu diekspos ke publik (via penyeimbang beban atau secara langsung).   
API ini harus beroperasi di semua antarmuka atau pada alamat IP tertentu (contoh: `--json-rpc 0.0.0.0:8545` atau `--json-prc 192.168.1.1:8545`  ).
:::info

Karena ini API yang berhadapan dengan publik, sebaiknya Anda memiliki penyeimbang beban/proxy balik di depannya untuk memberikan keamanan dan pembatasan tarif.

:::


- ***LibP2P*** -
Ini adalah API jaringan yang digunakan oleh node untuk komunikasi peer. API ini harus dijalankan di semua antarmuka atau alamat IP tertentu
(`--libp2p 0.0.0.0:1478` atau  `--libp2p 192.168.1.1:1478`). API tidak boleh diekspos secara publik,
tapi harus dapat dicapai dari semua node lainnya.
:::info

Jika dijalankan di localhost (`--libp2p 127.0.0.1:1478`), node lainnya tidak akan dapat terhubung.

:::


- ***GRPC*** -
API ini hanya untuk menjalankan perintah operator dan mencatat perintah yang lain. Karena itulah, API ini harus dijalankan hanya di localhost (`--grpc-address 127.0.0.1:9632`).

### Rahasia Polygon Edge {#polygon-edge-secrets}

Rahasia Polygon Edge (kunci `ibft` dan kunci `libp2p`) tidak boleh disimpan di sistem file lokal.  
Sebaliknya, [Pengelola Rahasia](configuration/secret-managers/set-up-aws-ssm) yang didukung harus digunakan.   
Menyimpan rahasia ke sistem file lokal harus boleh digunakan di lingkungan nonproduksi.

## Pemutakhiran {#update}

Berikut adalah prosedur pemutakhiran yang diinginkan untuk node validasi, yang dijelaskan dengan petunjuk langkah demi langkah.

### Prosedur pemutakhiran {#update-procedure}

- Unduh biner Polygon Edge terbaru dari [rilis](https://github.com/0xPolygon/polygon-edge/releases) GitHub resmi
- Hentikan layanan Polygon Edge (contoh: `sudo systemctl stop polygon-edge.service`)
- Ganti biner `polygon-edge` yang ada dengan biner yang telah diunduh (contoh: `sudo mv polygon-edge /usr/local/bin/`)
- Periksa apakah versi `polygon-edge` yang benar sudah ada dengan menjalankan `polygon-edge version` - harus sesuai dengan versi rilis
- Periksa dokumentasi rilis jika ada langkah kompatibilitas mundur yang perlu dilakukan sebelum memulai layanan `polygon-edge`
- Mulai layanan `polygon-edge` (contoh: `sudo systemctl start polygon-edge.service`)
- Terakhir, periksa keluaran log `polygon-edge` dan pastikan semuanya berjalan tanpa log `[ERROR]`

:::warning

Ketika ada rilis yang dapat menyebabkan terjadinya kegagalan, prosedur pemutakhiran ini harus dilakukan di semua node
biner yang berjalan saat ini tidak kompatibel dengan rilis yang baru.

Ini berarti bahwa rantai harus dihentikan selama periode waktu singkat (hingga biner `polygon-edge` diganti dan layanan dimulai)
jadi, rencanakan sesuai dengan itu.

Anda dapat menggunakan alat seperti **[Ansible](https://www.ansible.com/)** atau beberapa skrip kustom untuk melakukan pemutakhiran secara efisien
dan meminimalkan waktu downtime rantai.
:::

## Prosedur memulai {#startup-procedure}

Berikut ini aliran prosedur memulai yang dikehendaki untuk validator Polygon Edge

- Baca dokumen yang tercantum dalam bagian [Dasar Pengetahuan](#knowledge-base)
- Terapkan patch OS terbaru pada node validator
- Unduh biner `polygon-edge` terbaru dari [rilis](https://github.com/0xPolygon/polygon-edge/releases) GitHub resmi dan letakkan di instans lokal `PATH`
- Inisialisasi salah satu [pengelola rahasia](/docs/category/secret-managers) yang didukung menggunakan perintah CLI `polygon-edge secrets generate`
- Buat dan simpan rahasia menggunakan [perintah CLI](/docs/edge/get-started/cli-commands#secrets-init-flags) `polygon-edge secrets init`
- Catat nilai `NodeID` dan `Public key (address)`
- Buat file `genesis.json` seperti yang dijelaskan dalam [pengaturan cloud](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) menggunakan [perintah CLI](/docs/edge/get-started/cli-commands#genesis-flags) `polygon-edge genesis`
- Buat file konfigurasi default menggunakan [perintah CLI](/docs/edge/configuration/sample-config) `polygon-edge server export`
- Edit file `default-config.yaml` untuk mengakomodasi lingkungan node validator lokal (file patch, dll.)
- Buat layanan Polygon Edge (`systemd` atau yang serupa) karena biner `polygon-edge` akan menjalankan server dari file `default-config.yaml`
- Mulai server Polygon Edge dengan memulai layanan (contoh: `systemctl start polygon-edge`)
- Periksa keluaran log `polygon-edge` dan pastikan blok sudah dihasilkan serta tidak ada log `[ERROR]`
- Periksa fungsi rantai dengan memanggil metode JSON-RPC seperti [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)
