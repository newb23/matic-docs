---
id: set-up-gcp-secrets-manager
title: Menyiapkan GCP Secrets Manager
description: "Menyiapkan GCP Secrets Manager untuk Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Ikhtisar {#overview}

Saat ini, Polygon Edge berkaitan dengan penyimpanan 2 rahasia runtime utama:
* **Kunci privat validator** digunakan oleh node, jika node merupakan validator
* **Kunci privat jaringan** digunakan oleh libp2p untuk turut serta dan berkomunikasi dengan peer lainnya

Untuk informasi tambahan, silakan baca [Panduan Mengelola Kunci Privat](/docs/edge/configuration/manage-private-keys)

Modul Polygon Edge **tidak perlu mengetahui cara menyimpan rahasia**. Intinya, modul tidak perlu peduli apakah
rahasia disimpan di server yang jauh atau secara lokal di disk node.

Semua yang perlu diketahui modul tentang penyimpanan rahasia adalah **mengetahui cara penggunaan rahasia**, **mengetahui rahasia mana yang harus didapat
atau disimpan**. Perincian implementasi yang lebih baik dari operasi ini didelegasikan ke `SecretsManager` yang tentunya merupakan abstraksi.

Operator node yang memulai Polygon Edge sekarang dapat menentukan pengelola rahasia mana yang ingin digunakan dan ketika
pengelola rahasia yang benar dipakai, modul menangani rahasia melalui antarmuka yang disebutkan -
tanpa memperhatikan apakah rahasia disimpan di disk atau server.

Artikel ini menjabarkan langkah-langkah yang dibutuhkan untuk membuat Polygon Edge siap beroperasi dengan [GCP Secret Manager](https://cloud.google.com/secret-manager).

:::info panduan sebelumnya

**Sebaiknya**, sebelum mempelajari artikel ini, baca artikel tentang [**Pengaturan Lokal**](/docs/edge/get-started/set-up-ibft-locally)
dan [**Pengaturan Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Prasyarat {#prerequisites}
### Akun Penagihan GCP {#gcp-billing-account}
Untuk memanfaatkan GCP Secrets Manager, pengguna harus memiliki [Akun Penagihan](https://console.cloud.google.com/) yang diaktifkan pada portal GCP.
Akun Google baru pada platform GCP disediakan dengan beberapa dana untuk memulai, sebagai raja dari percobaan gratis.
Info selangkapnya tentang [Dokumen GCP](https://cloud.google.com/free)

### API Secrets Manager {#secrets-manager-api}
Pengguna harus mengaktifkan API GCP Secrets Manager, sebelum bisa menggunakannya.
Ini dapat dilakukan di [portal API Secrets Manager](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com).
Info selengkapnya: [Mengonfigurasi Secret Manger](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### Kredensial GCP {#gcp-credentials}
Akhirnya, pengguna harus membuat kredensial baru yang akan digunakan untuk autentikasi.
Ini dapat dilakukan dengan mengikuti instruksi yang diposkan [di sini](https://cloud.google.com/secret-manager/docs/reference/libraries).   
File json yang dibuat dan memuat kredensial, harus ditransfer ke setiap node yang perlu menggunakan GCP Secrets Manager.

Informasi yang dibutuhkan sebelum melanjutkan:
* **ID Proyek** (id proyek yang ditetapkan di platform GCP)
* **Lokasi File Kredensial** (jalur ke file json yang memuat kredensial)

## Langkah 1 - Buat konfigurasi pengelola rahasia {#step-1-generate-the-secrets-manager-configuration}

Supaya Polygon Edge dapat berkomunikasi lancar dengan GCP SM, perlu melakukan penguraian terhadap
file konfigurasi yang dibuat dan memuat semua informasi yang dibutuhkan untuk penyimpanan rahasia di GCP SM.

Untuk menghasilkan konfigurasi, jalankan perintah berikut:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Parameter yang ada:
* `PATH` adalah jalur ke mana file konfigurasi harus diekspor. Default `./secretsManagerConfig.json`
* `NODE_NAME` adalah nama node saat ini yang disiapkan untuk konfigurasi GCP SM. Ini dapat berupa nilai manasuka. Default `polygon-edge-node`
* `PROJECT_ID` adalah ID dari proyek yang ditentukan oleh pengguna pada konsol GCP selama penyiapan akun dan aktivasi API Secrets Manager.
* `GCP_CREDS_FILE` adalah jalur ke file json yang memuat kredensial yang memungkinkan akses baca/tulis ke Secrets Manager.

:::caution Nama node

Berhati-hatilah ketika menentukan nama node.

Polygon Edge menggunakan nama node tertentu untuk melacak rahasia yang dihasilkan dan digunakan di GCP SM.
Menentukan nama node yang sudah ada dapat berkonsekuensi pada kegagalan penulisan rahasia ke GCP SM.

Rahasia disimpan di jalur dasar berikut: `projects/PROJECT_ID/NODE_NAME`

:::

## Langkah 2 - Inisialisasi kunci rahasia menggunakan konfigurasi {#step-2-initialize-secret-keys-using-the-configuration}

Karena file konfigurasi sudah ada, kita dapat menginisialisasi kunci rahasia yang dibutuhkan dengan pengaturan
file konfigurasi di langkah 1 menggunakan `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Parameter `PATH` adalah lokasi parameter pengelola rahasia yang dihasilkan sebelumnya dari langkah 1.

## Langkah 3 - Buat file genesis {#step-3-generate-the-genesis-file}

File genesis harus dibuat dengan cara yang mirip dengan [**Pengaturan Lokal**](/docs/edge/get-started/set-up-ibft-locally)
dan panduan [**Pengaturan Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), dengan perubahan kecil.

Karena GCP SM digunakan alih-alih sistem file lokal, alamat validator harus ditambahkan melalui bendera `--ibft-validator`:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Langkah 4 - Mulai klien Polygon Edge {#step-4-start-the-polygon-edge-client}

Setelah kunci diatur dan file genesis dihasilkan, langkah terakhir proses ini yaitu memulai
Polygon Edge dengan perintah `server`.

Perintah `server` digunakan dengan cara yang sama seperti pada panduan yang disebutkan sebelumnya, dengan tambahan kecil - bendera `--secrets-config`:
```bash
polygon-edge server --secrets-config <PATH> ...
```

Parameter `PATH` adalah lokasi parameter pengelola rahasia yang dihasilkan sebelumnya dari langkah 1.