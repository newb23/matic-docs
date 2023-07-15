---
id: types
title: Types
description: Penjelasan modul types di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Ikhtisar {#overview}

Modul **Types** mengimplementasikan tipe objek inti, seperti:

* **Alamat**
* **Hash**
* **Header**
* banyak fungsi helper

## Encoding / Decoding RLP {#rlp-encoding-decoding}

Tidak seperti klien seperti GETH, Polygon Edge tidak menggunakan refleksi untuk melakukan encode.<br />
Preferensinya yakni tidak menggunakan refleksi karena itu menimbulkan masalah baru, seperti penurunan
kinerja dan penskalaan lebih sulit.

Modul **Types** menyediakan antarmuka yang mudah digunakan untuk marshaling dan unmarshalling RLP, menggunakan paket FastRLP.

Marshaling dilakukan melalui metode *MarshalRLPWith* dan *MarshalRLPTo*. Metode analog ada untuk
unmarshalling.

Dengan menentukan metode ini secara manual, Polygon Edge tidak perlu menggunakan refleksi. Dalam *rlp_marshal.go*, Anda dapat menemukan
metode untuk marshaling:

* **Isi**
* **Blok**
* **Header**
* **Tanda terima**
* **Log**
* **Transaksi**