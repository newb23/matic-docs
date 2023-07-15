---
id: validators
title: FAQ Validator
description: "FAQ untuk validator Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Bagaimana cara menambahkan/menghapus validator? {#how-to-add-remove-a-validator}

### PoA {#poa}
Menambahkan/menghapus validator dilakukan dengan pemungutan suara. Anda dapat menemukan panduan lengkap tentang hal ini [di sini](/docs/edge/consensus/poa).

### PoS {#pos}
Anda dapat menemukan panduan tentang cara melakukan stake dana [di sini](/docs/edge/consensus/pos-stake-unstake), sehingga sebuah node dapat menjadi validator, dan cara melakukan unstake (menghapus validator).

Harap diperhatikan bahwa:
- Anda dapat menggunakan bendera genesis `--max-validator-count` untuk mengatur jumlah maksimum staker yang dapat bergabung dengan set validator.
- Anda dapat menggunakan bendera genesis `--min-validator-count ` untuk mengatur jumlah minimum staker yang dibutuhkan untuk bergabung dengan set validator (`1` secara default).
- Ketika jumlah validator maksimal terpenuhi, Anda tidak dapat menambah validator lain sampai Anda menghapus satu validator yang ada dari set validator (tidak peduli apakah jumlah stake pada set validator baru ini lebih tinggi). Jika menghapus sebuah validator, maka jumlah validator yang tersisa tidak boleh kurang dari `--min-validator-count`.
- Ada ambang batas default unit `1` dari mata uang jaringan (gas) asli untuk menjadi validator.



## Berapa ruang diska yang direkomendasikan untuk validator? {#how-much-disk-space-is-recommended-for-a-validator}

Sebaiknya, mulai dengan ruang diska 100 G sebagai landasan utama yang diperkirakan secara konservatif dan pastikan ada kemungkinan menskalakan diska nantinya.


## Apakah ada batas jumlah validator? {#is-there-a-limit-to-the-number-of-validators}

Jika kita membahas tentang batas teknis, Polygon Edge tidak secara eksplisit menentukan batas jumlah node yang bisa dimiliki dalam jaringan. Anda dapat mengatur batas koneksi (jumlah koneksi masuk/keluar) pada setiap node.

Jika kita membahas tentang batas praktis, Anda akan melihat penurunan performa yang lebih buruk pada klaster dengan 100 node dibandingkan klaster dengan 10 node. Dengan menaikkan jumlah node dalam klaster, Anda akan meningkatkan kompleksitas komunikasi dan hanya overhead jaringan secara umum. Semua tergantung pada jenis jaringan yang dijalankan dan topologi jaringan yang dimiliki.

## Bagaimana cara beralih dari PoA ke PoS? {#how-to-switch-from-poa-to-pos}

PoA adalah mekanisme konsensus default. Untuk klaster baru dan berpindah ke PoS, Anda perlu menambah bendera `--pos` ketika membuat file genesis. Jika klaster sudah beroperasi, Anda dapat menemukan cara beralih [di sini](/docs/edge/consensus/migration-to-pos). Semua info yang dibutuhkan tentang mekanisme dan pengaturan konsensus dapat ditemukan di [bagian konsensus](/docs/edge/consensus/poa).

## Bagaimana cara memperbarui node ketika ada perubahan yang menyebabkan bagian lain gagal? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

Anda dapat menemukan panduan terperinci tentang cara melakukan prosedur ini [di sini](/docs/edge/validator-hosting#update).

## Apakah jumlah stake minimum dapat dikonfigurasi untuk Pos Edge? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

Jumlah stake minimum default adalah `1 ETH` dan tidak dapat dikonfigurasi.

## Mengapa perintah JSON RPC `eth_getBlockByNumber` dan `eth_getBlockByHash` tidak menampilkan alamat penambang? {#not-return-the-miner-s-address}

Konsensus yang digunakan di Polygon Edge adalah IBFT 2.0, yang kemudian dibangun berdasarkan mekanisme pemungutan suara yang dijelaskan dalam Clique PoA: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).

Jika melihat EIP-225 (Clique PoA), ini bagian relevan yang menjelaskan kegunaan `miner` (alias `beneficiary`):

<blockquote>
Kami menyempurnakan bidang header ethash menjadi seperti berikut:
<ul>
<li><b>penerima manfaat/penambang:</b> Alamat untuk mengusulkan perubahan daftar penandatangan yang sah.</li>
<ul>
<li>Harus diisi dengan nol, biasanya hanya diubah ketika pemungutan suara.</li>
<li>Nilai arbitrer tetap diperkenankan (bahkan yang tidak berarti seperti pemungutan suara untuk memilih non-penandatangan) guna menghindari kompleksitas lain dalam implementasi seputar mekanika pemungutan suara.</li>
<li>Harus diisi dengan nol pada blok titik periksa (yaitu transisi epoch). </li>
</ul>

</ul>

</blockquote>

Jadi, bidang `miner` digunakan untuk mengusulkan pemilihan alamat tertentu, bukan menampilkan pengusul blok.

Informasi tentang pengusul blok dapat ditemukan dengan memulihkan pubkey dari bidang Seal dari bidang data ekstra Istanbul yang dikodekan RLP dalam header blok.

## Bagian dan nilai Kejadian yang dapat dimodifikasi dengan aman? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Pastikan untuk membuat salinan manual dari file genesis.json yang ada sebelum mencoba untuk mengubahnya. Juga, seluruh rantai harus dihentikan sebelum menyunting file genesis.json. Setelah file genesis dimodifikasi, versi baru dari itu harus didistribusikan ke seluruh node non-validator dan valdiator.

:::

**Hanya bagian bootnode dari file genesis yang dapat dimodifikasi dengan aman**, di mana Anda dapat menambahkan atau menghapus bootnode dari daftar.