---
id: set-up-aws-ssm
title: Pengaturan AWS SSM (Pengelola Sistem)
description: "Pengaturan AWS SSM (Pengelola Sistem) untuk Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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
tanpa memedulikan apakah rahasia disimpan di disk maupun di server.

Artikel ini menjelaskan langkah-langkah yang diperlukan untuk mendapatkan Polygon Edge dan menjalankan
[Penyimpanan Parameter Manajer Sistem AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

:::info Panduan sebelumnya

**Sebaiknya**, sebelum mempelajari artikel ini, baca artikel tentang [**Pengaturan Lokal**](/docs/edge/get-started/set-up-ibft-locally)
dan [**Pengaturan Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Prasyarat {#prerequisites}
### Kebijakan IAM {#iam-policy}
Pengguna perlu membuat Kebijakan IAM yang memungkinkan operasi baca/tulis untuk Penyimpanan Parameter Manajer Sistem AWS.
Setelah berhasil membuat Kebijakan IAM, pengguna perlu menempelkannya ke instans EC2 yang menjalankan server Polygon Edge.
Kebijakan IAM akan terlihat seperti ini:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Informasi lebih lanjut tentang Peran IAM AWS SSM dapat ditemukan di [dokumen AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Informasi yang dibutuhkan sebelum melanjutkan:
* **Wilayah** (wilayah tempat keberadaan Pengelola Sistem dan node)
* **Jalur Parameter** (jalur arbitrer untuk menempatkan rahasia itu, misalnya `/polygon-edge/nodes`)

## Langkah 1 - Buat konfigurasi pengelola rahasia {#step-1-generate-the-secrets-manager-configuration}

Agar Polygon Edge dapat berkomunikasi dengan AWS SSM secara lancar, perlu mengurai
file konfigurasi yang telah dihasilkan, yang berisi semua informasi yang diperlukan untuk penyimpanan rahasia di AWS SSM.

Untuk menghasilkan konfigurasi, jalankan perintah berikut:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Parameter yang ada:
* `PATH` adalah jalur ke mana file konfigurasi harus diekspor. Default `./secretsManagerConfig.json`
* `NODE_NAME` adalah nama node saat ini yang diatur sebagai konfigurasi AWS SSM. Ini dapat berupa nilai manasuka. Default `polygon-edge-node`
* `REGION` adalah wilayah lokasi AWS SSM. Ini harus merupakan wilayah yang sama dengan node yang menggunakan AWS SSM.
* `SSM_PARAM_PATH` adalah nama jalur rahasia akan disimpan. Misalnya jika `--name node1` dan `ssm-parameter-path=/polygon-edge/nodes`
ditentukan, rahasia akan disimpan sebagai `/polygon-edge/nodes/node1/<secret_name>`

:::caution Nama node

Berhati-hatilah ketika menentukan nama node.

Polygon Edge menggunakan nama node yang ditentukan untuk melacak rahasia yang dihasilkan dan digunakan di AWS SSM.
Menentukan nama node yang ada dapat memiliki konsekuensi gagal menulis rahasia ke AWS SSM.

Rahasia disimpan di jalur dasar berikut: `SSM_PARAM_PATH/NODE_NAME`

:::

## Langkah 2 - Inisialisasi kunci rahasia menggunakan konfigurasi {#step-2-initialize-secret-keys-using-the-configuration}

Karena file konfigurasi sudah ada, kita dapat menginisialisasi kunci rahasia yang dibutuhkan dengan pengaturan
file konfigurasi di langkah 1 menggunakan `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Parameter `PATH` adalah lokasi parameter pengelola rahasia yang dihasilkan sebelumnya dari langkah 1.

:::info Kebijakan IAM
Langkah ini akan gagal jika Kebijakan IAM yang memungkinkan operasi baca/tulis tidak dikonfigurasi dengan benar dan/atau tidak melekat ke instans EC2 yang menjalankan perintah ini.

:::

## Langkah 3 - Buat file genesis {#step-3-generate-the-genesis-file}

File genesis harus dibuat dengan cara yang mirip dengan [**Pengaturan Lokal**](/docs/edge/get-started/set-up-ibft-locally)
dan panduan [**Pengaturan Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud) dengan perubahan kecil.

Karena AWS SSM digunakan sebagai ganti sistem file lokal, alamat validator harus ditambahkan melalui bendera `--ibft-validator`:
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