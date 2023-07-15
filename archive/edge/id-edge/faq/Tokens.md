---
id: tokens
title: FAQ Token
description: "FAQ untuk token Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Apakah Polygon Edge mendukung EIP-1559? {#does-polygon-edge-support-eip-1559}
Saat ini, Polygon Edge tidak mendukung EIP-1559.

## Bagaimana cara mengatur simbol mata uang (token)? {#how-to-set-the-currency-token-symbol}

Simbol token tercakup dalam UI, sehingga tidak dapat dikonfigurasi atau dikode keras di mana saja di dalam jaringan.
Tapi Anda dapat tambah perubahan ketika Anda tambah jaringan ke dompet, seperti Metamask, misalnya.

## Apa yang terjadi pada transaksi ketika terjadi a {#what-happens-to-transactions-when-a-chain-halts}

Semua transaksi yang belum diproses berada di dalam antrian TxPool(enqueued atau dipromosikan ). Jika halte rantai (semua pemberhentian produksi blok), transaksi ini tidak akan pernah menjadi blok.<br/> Ini bukan hanya kasus ketika rantai berhenti. Jika node dihentikan atau di-ulang, semua transaksi yang belum dieksekusi, dan masih ada di TxPool, akan dihilangkan secara diam-diam.<br/> Hal yang sama akan terjadi pada transaksi ketika perubahan yang melanggar diperkenalkan, karena diperlukan node untuk di-ulang.
