---
id: poa
title: Proof of Authority (PoA)
description: "Penjelasan dan instruksi mengenai Proof of Autority."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Ikhtisar {#overview}

PoA IBFT adalah mekanisme konsensus default di Polygon Edge. Di PoA, validator yang bertanggung jawab membuat blok dan menambahkannya ke blockchain dalam rangkaian.

Semua validator membentuk set validator dinamis, agar validator dapat ditambahkan ke atau dihapus dari set dengan menggunakan mekanisme pemungutan suara. Ini berarti bahwa validator dapat dipilih masuk/keluar dari set validator jika mayoritas (51%) node validator memilih menambah/menurunkan validator tertentu ke/dari set. Dengan cara ini, validator berbahaya dapat dikenali dan dihapus dari jaringan, sementara validator tepercaya baru dapat ditambahkan ke jaringan.

Semua validator bergantian mengajukan blok berikutnya (giliran) dan untuk blok yang akan divalidasi/dimasukkan di blockchain, mayoritas (lebih dari 2/3) validator harus menyetujui blok tersebut.

Selain validator, ada nonvalidator yang turut serta dalam pembuatan blok, tetapi turut serta dalam proses validasi blok.

## Menambahkan validator ke set validator {#adding-a-validator-to-the-validator-set}

Panduan ini menjelaskan cara menambah node validator baru ke jaringan IBFT aktif dengan 4 node validator.
Jika Anda perlu bantuan mengatur jaringan mengacu pada bagian [Setup](/edge/get-started/set-up-ibft-locally.md) / [Pengaturan](/edge/get-started/set-up-ibft-on-the-cloud.md) Cloud.

### Langkah 1: Inisialisasi folder data untuk IBFT dan buat kunci validator​ untuk node baru {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Untuk memulai dan menjalankan IBFT di node baru, Anda perlu menginisialisasi folder data dan membuat kunci terlebih dahulu:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Perintah ini akan mencetak kunci validator (alamat) dan ID node. Anda akan membutuhkan kunci validator (alamat) untuk langkah berikutnya.

### Langkah 2: Mengusulkan kandidat baru dari node validator lainnya {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Agar node baru menjadi validator, setidaknya 51% validator perlu mengusulkan dirinya.

Contoh cara mengusulkan validator baru (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) dari node validasi yang ada di alamat grpc: 127.0.0.1:10000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

Struktur perintah IBFT tercakup di bagian [Perintah CLI](/docs/edge/get-started/cli-commands).

:::info Kunci publik BLS

Kunci publik BLS hanya diperlukan jika jaringan berjalan dengan BLS, untuk jaringan yang tidak berjalan dalam mode BLS, `--bls` tidak diperlukan

:::

### Langkah 3: Jalankan node klien {#step-3-run-the-client-node}

Karena dalam contoh ini kita coba menjalankan jaringan tempat semua node berada di mesin yang sama, maka harus berhati-hati untuk menghindari konflik port.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Setelah mengambil semua blok, di dalam konsol Anda akan memperhatikan bahwa node baru turut serta dalam validasi

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Mempromosikan nonvalidator ke validator

Secara alami, nonvalidator dapat menjadi validator melalui proses pemungutan suara, tetapi agar berhasil dimasukkan dalam set validator setelah proses pemungutan suara, node harus dimulai ulang dengan bendera `--seal`.

:::

## Menghapus validator dari set validator {#removing-a-validator-from-the-validator-set}

Operasi ini cukup sederhana. Untuk menghapus node validator dari set validator, perintah ini perlu dilakukan pada mayoritas node validator.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Kunci publik BLS

Kunci publik BLS hanya diperlukan jika jaringan berjalan dengan BLS. Untuk jaringan yang tidak berjalan dalam mode BLS, tidak perlu `--bls`

:::

Setelah perintah dilaksanakan, amati bahwa jumlah validator telah turun (dalam contoh log ini dari 4 ke 3).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````
