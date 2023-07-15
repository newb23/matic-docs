---
id: set-up-hashicorp-vault
title: Menyiapkan Hashicorp Vault
description: "Menyiapkan Hashicorp Vault untuk Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Ikhtisar {#overview}

Saat ini, Polygon Edge berkaitan dengan penyimpanan 2 rahasia runtime utama:
* **Kunci privat validator** digunakan oleh node, jika node merupakan validator
* **Kunci privat jaringan** digunakan oleh libp2p untuk turut serta dan berkomunikasi dengan peer lainnya

:::warning

Kunci privat validator bersifat unik bagi setiap node validator. Kunci yang sama <b>tidak</b> disimpan di semua validator, karena ini dapat mengganggu keamanan rantai Anda.

:::

Untuk informasi tambahan, silakan baca [Panduan Mengelola Kunci Privat](/docs/edge/configuration/manage-private-keys)

Modul Polygon Edge **tidak perlu mengetahui cara menyimpan rahasia**. Intinya, modul tidak perlu peduli apakah
rahasia disimpan di server yang jauh atau secara lokal di disk node.

Semua yang perlu diketahui modul tentang penyimpanan rahasia adalah **mengetahui cara penggunaan rahasia**, **mengetahui rahasia mana yang harus didapat
atau disimpan**. Perincian implementasi yang lebih baik dari operasi ini didelegasikan ke `SecretsManager` yang tentunya merupakan abstraksi.

Operator node yang memulai Polygon Edge sekarang dapat menentukan pengelola rahasia mana yang ingin digunakan dan ketika
pengelola rahasia yang benar dipakai, modul menangani rahasia melalui antarmuka yang disebutkan -
tanpa memperhatikan apakah rahasia disimpan di disk atau di server.

Artikel ini menjabarkan langkah-langkah yang dibutuhkan untuk menyiapkan dan menjalankan Polygon Edge dengan server [Hashicorp Vault](https://www.vaultproject.io/).

:::info Panduan sebelumnya

**Sebaiknya**, sebelum mempelajari artikel ini, baca artikel tentang [**Pengaturan Lokal**](/docs/edge/get-started/set-up-ibft-locally)
dan [**Pengaturan Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Prasyarat {#prerequisites}

Artikel ini mengasumsikan bahwa instans yang berfungsi dari server Hashicorp Vault **sudah disiapkan**.

Selain itu, server Hashicorp Vault yang digunakan untuk Polygon Edge wajib telah **mengaktifkan penyimpanan KV**.

Informasi yang dibutuhkan sebelum melanjutkan:
* **URL server** (URL API server Hashicorp Vault)
* **Token** (token akses untuk mengakses mesin penyimpanan KV)

## Langkah 1 - Buat konfigurasi pengelola rahasia {#step-1-generate-the-secrets-manager-configuration}

Supaya Polygon Edge dapat berkomunikasi lancar dengan server Vault, perlu menguraikan file
konfigurasi yang sudah dihasilkan dan memuat semua informasi yang dibutuhkan untuk penyimpanan rahasia di Vault.

Untuk menghasilkan konfigurasi, jalankan perintah berikut:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Parameter yang ada:
* `PATH` adalah jalur ke mana file konfigurasi harus diekspor. Default `./secretsManagerConfig.json`
* `TOKEN` adalah token akses yang disebutkan sebelumnya di [bagian prasyarat](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `SERVER_URL` adalah URL API untuk server Vault yang juga disebutkan di [bagian prasyarat](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `NODE_NAME` adalah nama node saat ini yang disiapkan sebagai konfigurasi Vault. Ini dapat berupa nilai manasuka. Default `polygon-edge-node`

:::caution Nama node

Berhati-hatilah ketika menentukan nama node.

Polygon Edge menggunakan nama node spesifik untuk melacak rahasia yang dibuatnya dan digunakan di instans Vault.
Menyebutkan nama node yang ada dapat memiliki konsekuensi yaitu data di server Vault akan terhapus.

Rahasia disimpan di jalur dasar berikut: `secrets/node_name`

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

Karena Hashicorp Vault digunakan alih-alih sistem file lokal, alamat validator harus ditambahkan melalui bendera `--ibft-validator`:
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