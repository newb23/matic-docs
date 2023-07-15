---
id: set-up-ibft-locally
title: Pengaturan Lokal
description: "Panduan langkah-langkah pengaturan lokal."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Panduan ini hanya untuk pengujian

Panduan di bawah akan mengarahkan tentang cara mengatur jaringan Polygon Edge di komputer lokal untuk pengujian
dan pengembangan.

Prosedur ini berbeda jauh dari cara pengaturan jaringan Polygon Edge untuk skenario penggunaan nyata
a cloud: **[Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## Persyaratan {#requirements}

Lihat [Instalasi](/docs/edge/get-started/installation) untuk menginstal Polygon Edge.

## Ikhtisar {#overview}

![Pengaturan Lokal](/img/edge/ibft-setup/local.svg)

Dalam panduan ini, tujuan kita adalah membangun jaringan blockchain `polygon-edge` yang bekerja dengan [protokol konsensus IBFT](https://github.com/ethereum/EIPs/issues/650).
Jaringan blockchain akan terdiri dari 4 node yang keempatnya merupakan node validator dan sebagai syarat untuk mengusulkan dan memvalidasi blok yang datang dari pengusul lain.
Keempat node itu akan bekerja di mesin yang sama, karena gagasan panduan ini adalah memberikan klaster IBFT yang berfungsi sepenuhnya dalam waktu singkat.

Oleh karena itu, kami memberikan panduan melalui 4 langkah mudah:

1. Inisialisasi direktori data akan menghasilkan kunci validator untuk setiap 4 node dan menginisialisasi direktori data blockchain kosong. Kunci validator penting karena kita perlu melakukan bootstrap blok genesis dengan pengaturan awal validator menggunakan kunci ini.
2. Menyiapkan string koneksi untuk bootnode akan menjadi informasi vital bagi setiap node yang akan kita jalankan, seperti node mana yang dihubungkan ketika memulai kali pertama.
3. Menghasilkan file `genesis.json` akan diperlukan sebagai input kunci validator yang dihasilkan langkah dalam **langkah 1** untuk pengaturan validator awal jaringan dalam blok genesis dan string koneksi bootnode dari **langkah 2**.
4. Menjalankan semua node adalah tujuan akhir dari panduan ini dan akan menjadi langkah terakhir yang kita lakukan, kita akan menginstruksikan node yang data direktorinya akan digunakan dan lokasi pencarian `genesis.json` yang melakukan bootstrap kondisi jaringan awal.

Karena keempat node akan berjalan di host lokal, selama proses pengaturan diharapkan semua direktori data
untuk setiap node berada dalam direktori induk yang sama.

:::info Jumlah validator

Tidak ada jumlah node minimum dalam sebuah klaster, artinya, sebuah klaster dapat memiliki hanya 1 node validator.
Ingat bahwa dengan klaster node _tunggal_, maka **tidak ada toleransi kerusakan** dan **tidak ada jaminan BFT**.

Jumlah node minimum yang direkomendasikan untuk bisa mendapatkan jaminan BFT adalah 4 - karena dalam sebuah klaster 4 node, kegagalan
node 1 dapat ditoleransi karena ada sisa 3 node yang berfungsi normal.

:::

## Langkah 1: Inisialisasi folder data untuk IBFT dan hasilkan kunci validator {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Agar IBFT siap dioperasikan, Anda perlu menginisialisasi folder data,
satu untuk setiap node:

````bash
polygon-edge secrets init --data-dir test-chain-1
````

````bash
polygon-edge secrets init --data-dir test-chain-2
````

````bash
polygon-edge secrets init --data-dir test-chain-3
````

````bash
polygon-edge secrets init --data-dir test-chain-4
````

Setiap perintah ini akan mencetak kunci validator, kunci publik bls, dan [ID node](https://docs.libp2p.io/concepts/peer-id/). Anda akan membutuhkan ID Node dari node pertama untuk langkah berikutnya.

### Menampilkan Rahasia {#outputting-secrets}
Output rahasia dapat diakses lagi, jika diperlukan.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Langkah 2: Siapkan string koneksi multiaddr untuk bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Agar berhasil membangun konektivitas, node harus tahu server `bootnode` mana yang dihubungkan untuk mendapatkan
informasi tentang semua node yang tersisa pada jaringan. `bootnode` terkadang juga dikenal sebagai server `rendezvous` dalam jargon p2p.

`bootnode` bukan instans khusus node polygon-edge. Setiap node polygon-edge dapat berfungsi sebagai `bootnode`, tetapi
setiap node polygon-edge perlu memiliki set bootnode yang ditentukan yang akan dihubungi untuk memberikan informasi tentang cara menghubungkan dengan
semua node yang tersisa di jaringan.

Untuk membuat string koneksi yang menentukan bootnode, kita perlu menyesuaikan
dengan [format multiaddr](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

Dalam panduan ini, kita akan memperlakukan node pertama dan kedua sebagai bootnode untuk semua node lainnya. Yang akan terjadi dalam skenario ini
adalah semua node yang terhubung ke `node 1` atau `node 2` akan mendapatkan informasi tentang cara terhubung satu sama lain melalui
bootnode yang saling dihubungi.

:::info Anda harus menentukan setidaknya satu bootnode untuk memulai node

Setidaknya diperlukan **satu** bootnode, sehingga node lain yang ada dalam jaringan dapat saling menemukan. Sebaiknya menggunakan lebih banyak bootnode, karena
mereka akan memberikan daya tahan terhadap jaringan ketika terjadi gangguan.
Dalam panduan ini, kami akan mencantumkan dua node, tetapi ini dapat diubah dengan cepat tanpa berdampak pada validitas file `genesis.json`.

:::

Karena berjalan di localhost, bisa diasumsikan bahwa `<ip_address>` merupakan `127.0.0.1`.

Untuk `<port>`, kita akan menggunakan `10001`, karena kita akan mengatur server libp2p agar `node 1` mendengarkan di port ini nantinya.

Terakhir, kita membutuhkan `<node_id>` yang bisa didapatkan dari output perintah yang dijalankan sebelumnya, perintah `polygon-edge secrets init --data-dir test-chain-1` (yang digunakan untuk menghasilkan kunci dan direktori data untuk `node1`)

Setelah perakitan, string koneksi multiaddr ke `node 1` yang akan kita gunakan sebagai bootnode akan terlihat seperti ini (hanya `<node_id>` yang pada akhirnya harus berbeda):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Demikian pula, kita membangun multiaddr untuk bootnode kedua seperti yang ditunjukkan di bawah
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info Nama host DNS, alih-alih ips

Polygon Edge mendukung penggunaan nama host DNS untuk konfigurasi node. Ini fitur yang sangat membantu untuk penyebaran berbasis cloud, sebab ip node dapat berubah karena berbagai alasan.

Format multiaddr untuk string koneksi saat menggunakan nama host DNS adalah sebagai berikut:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Langkah 3: Menghasilkan file genesis dengan 4 node sebagai validator {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Yang dilakukan perintah ini:

* `--ibft-validators-prefix-path` mengatur jalur folder prefiks ke jalur folder yang ditentukan agar dapat digunakan IBFT
di Polygon Edge. Direktori ini untuk menampung folder `consensus/`, yakni tempat penyimpanan kunci privat validator. Kunci
publik validator diperlukan untuk membangun file genesis - daftar awal node bootstrap.
Bendera ini hanya dapat dimengerti ketika mengatur jaringan di localhost, seperti dalam skenario nyata, kita tidak dapat mengharapkan semua
direktori data node untuk berada di filesystem sama yang kunci publiknya dapat kita baca dengan mudah.
* `--bootnode` mengatur alamat bootnode yang akan mengaktifkan node untuk menemukan satu sama lain.
Kita akan menggunakan string multiaddr `node 1`, seperti yang disebutkan dalam **langkah 2**.

Hasil dari perintah ini adalah `genesis.json` file yang berisi blok genesis dari blockchain baru kami, dengan set validator yang telah ditentukan sebelumnya dan konfigurasi node mana yang harus dihubungi terlebih dahulu untuk membangun konektivitas.

:::info Ganti ke ECDSA

BLS adalah mode validasi default dari header blok. Jika Anda ingin rantai Anda untuk dijalankan dalam mode ECDSA, Anda dapat menggunakan `—ibft-validator-type`bendera dengan argumen `ecdsa`:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Saldo akun premining

Anda mungkin ingin mengatur jaringan blockchain dengan beberapa alamat yang memiliki saldo "pratambang".

Untuk itu, Anda harus memberikan sebanyak mungkin bendera `--premine` pada setiap alamat yang ingin diinisialisasi dengan saldo tertentu
di blockchain.

Misalnya, jika kita ingin melakukan pratambang 1000 eth ke alamat `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` di blok genesis, maka kita perlu memberikan argumen berikut:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Perlu diperhatikan bahwa jumlah saldo pratambang dalam WEI, bukan ETH.**

:::

:::info Mengatur batas gas blok

Batas gas default untuk setiap blok adalah .`5242880`. Nilai ini ditulis dalam file genesis, tetapi Anda mungkin ingin
menaikkan/menurunkannya.

Untuk melakukan hal itu, Anda dapat menggunakan bendera `--block-gas-limit` yang diikuti dengan nilai yang diinginkan seperti yang ditunjukkan di bawah ini:

```shell
--block-gas-limit 1000000000
```

:::

:::info Menentukan batas deskriptop file sistem

Batas file deskriptor default (jumlah maksimum file terbuka) pada beberapa sistem operasi cukup kecil.
Jika node yang diharapkan memiliki throughput yang tinggi, Anda mungkin mempertimbangkan untuk menaikkan batas ini pada tingkat OS.

Untuk distro Ubuntu, prosedurnya adalah sebagai berikut (jika Anda tidak menggunakan distro Ubuntu/Debian, lihat dokumen resmi untuk OS Anda):
- Periksa batas os saat ini (file terbuka)
```shell title="ulimit -a"
ubuntu@ubuntu:~$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 15391
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 15391
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

- Naikkan batas file terbuka
	- Secara lokal - hanya memengaruhi sesi saat ini:
	```shell
	ulimit -u 65535
	```
	- Secara global atau per pengguna (tambah batas pada akhir file /etc/security/limits.conf):
	```shell
	sudo vi /etc/security/limits.conf  # we use vi, but you can use your favorite text editor
	```
	```shell title="/etc/security/limits.conf"
	# /etc/security/limits.conf
	#
	#Each line describes a limit for a user in the form:
	#
	#<domain>        <type>  <item>  <value>
	#
	#Where:
	#<domain> can be:
	#        - a user name
	#        - a group name, with @group syntax
	#        - the wildcard *, for default entry
	#        - the wildcard %, can be also used with %group syntax,
	#                 for maxlogin limit
	#        - NOTE: group and wildcard limits are not applied to root.
	#          To apply a limit to the root user, <domain> must be
	#          the literal username root.
	#
	#<type> can have the two values:
	#        - "soft" for enforcing the soft limits
	#        - "hard" for enforcing hard limits
	#
	#<item> can be one of the following:
	#        - core - limits the core file size (KB)
	#        - data - max data size (KB)
	#        - fsize - maximum filesize (KB)
	#        - memlock - max locked-in-memory address space (KB)
	#        - nofile - max number of open file descriptors
	#        - rss - max resident set size (KB)
	#        - stack - max stack size (KB)
	#        - cpu - max CPU time (MIN)
	#        - nproc - max number of processes
	#        - as - address space limit (KB)
	#        - maxlogins - max number of logins for this user

	#        - maxsyslogins - max number of logins on the system
	#        - priority - the priority to run user process with
	#        - locks - max number of file locks the user can hold
	#        - sigpending - max number of pending signals
	#        - msgqueue - max memory used by POSIX message queues (bytes)
	#        - nice - max nice priority allowed to raise to values: [-20, 19]
	#        - rtprio - max realtime priority
	#        - chroot - change root to directory (Debian-specific)
	#
	#<domain>      <type>  <item>         <value>
	#

	#*               soft    core            0
	#root            hard    core            100000
	#*               hard    rss             10000
	#@student        hard    nproc           20
	#@faculty        soft    nproc           20
	#@faculty        hard    nproc           50
	#ftp             hard    nproc           0
	#ftp             -       chroot          /ftp
	#@student        -       maxlogins       4

	*               soft    nofile          65535
	*               hard    nofile          65535

	# End of file
	```
Secara opsional, ubah parameter tambahan, simpan file, dan mulai ulang sistem.
Setelah memulai ulang, periksa lagi batas deskriptor file.
Itu harus diatur ke nilai yang didefinisikan dalam file limits.conf.

:::


## Langkah 4: Jalankan semua klien {#step-4-run-all-the-clients}

Karena kita berupaya menjalankan jaringan Polygon Edge yang terdiri dari 4 node yang semuanya di mesin yang sama, kita perlu berhati-hati untuk
menghindari konflik port. Inilah alasan kita akan menggunakan penalaran berikut untuk menentukan port pendengaran dari setiap node:

- `10000` untuk server gRPC dari `node 2`, `20000` untuk server GRPC dari `node 1`, dll.
- `10001` untuk server libp2p dari `node 2`, `20001` untuk server libp2p dari `node 1`, dll.
- `10002` untuk server JSON-RPC dari `node 1`, `20002` untuk server JSON-RPC dari `node 2`, dll.

Untuk menjalankan klien **pertama** (catat port `10001`, karena itu digunakan sebagai bagian dari libp2p multiaddr di **langkah 2** bersama Node ID node 1):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Untuk menjalankan klien **kedua**:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Untuk menjalankan klien **ketiga**:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Untuk menjalankan klien **keempat**:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Untuk membahas secara singkat apa yang telah dilakukan sejauh ini:

* Direktori data klien telah ditentukan yakni **./test-chain-\***
* Server GRPC telah dimulai pada port **10000**, **20000**, **30000**, dan **40000** untuk masing-masing node
* Server libp2p telah dimulai di port **10001**, **20001**, **30001**, dan **40001** untuk masing-masing node
* Server JSON-RPC telah dimulai pada port **10002**, **20002**, **30002**, dan **40002** untuk masing-masing node
* Bendera *seal* berarti bahwa node yang dimulai akan turut serta menyegel blok
* Bendera *chain* menentukan yang file genesis harus digunakan untuk konfigurasi rantai

Struktur file genesis dibahas dalam bagian [Perintah CLI.](/docs/edge/get-started/cli-commands).

Setelah menjalankan perintah sebelumnya, Anda telah mengatur jaringan Polygon Edge 4 node, mampu menyegel blok, dan memulihkan
dari kegagalan node.

:::info Mulai klien menggunakan file konfigurasi

Alih-alih menentukan semua parameter konfigurasi sebagai argumen CLI, Klien juga dapat mulai menggunakan file konfigurasi dengan mengeksekusi perintah berikut:

````bash
polygon-edge server --config <config_file_path>
````
Contoh:

````bash
polygon-edge server --config ./test/config-node1.json
````
Saat ini, kami mendukung `yaml`dan `json`berbasis file konfigurasi yang dapat ditemukan **[di sini](/docs/edge/configuration/sample-config)**

:::

:::info Langkah-langkah untuk menjalankan node non-validator

Node nonvalidator akan selalu menyinkronkan blok terakhir yang diterima dari node validasi, Anda dapat memulai node nonvalidator dengan menjalankan perintah berikut.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Misalnya, Anda dapat menambahkan klien Nonvalidator **kelima** dengan menjalankan perintah berikut:

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Menentukan batas harga

Node Polygon Edge dapat dimulai dengan set **batas harga** untuk transaksi masuk.

Unit batas harga adalah `wei`.

Mengatur batas harga berarti transaksi apa pun yang diproses oleh node saat ini harus memiliki harga gas **lebih tinggi**
kemudian batas harga ditetapkan. Jika tidak, maka tidak akan disertakan dalam blok.

Membuat mayoritas node menghormati batas harga tertentu akan menegakkan aturan bahwa transaksi dalam jaringan
tidak boleh berada di bawah ambang batas harga tertentu.

Nilai default batas harga adalah `0`, artinya, secara default, batas harga itu tidak diberlakukan.

Contoh penggunaan bendera `--price-limit`:
````bash
polygon-edge server --price-limit 100000 ...
````

Harap diperhatikan bahwa batas harga **diberlakukan hanya pada transaksi nonlokal**, berarti
batas harga tidak berlaku untuk transaksi yang ditambahkan secara lokal pada node.

:::

:::info URL WebSocket

Secara default, ketika menjalankan Polygon Edge akan dihasilkan URL WebSocket berdasarkan lokasi rantai.
Skema URL `wss://` digunakan untuk tautan HTTPS dan `ws://` untuk HTTP.

URL WebSocket Localhost:
````bash
ws://localhost:10002/ws
````
Perlu diperhatikan bahwa nomor port tergantung pada port JSON-RPC yang dipilih untuk node tersebut.

URL WebSocket Edgenet:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Langkah 5: Berinteraksi dengan jaringan polygon-edge {#step-5-interact-with-the-polygon-edge-network}

Karena Anda telah mengatur setidaknya 1 klien yang beroperasi, Anda dapat berinteraksi dengan blockchain menggunakan akun pratambang di atas
dan dengan menentukan URL JSON-RPC ke salah satu dari 4 node:
- Node 1: `http://localhost:10002`
- Node 2: `http://localhost:20002`
- Node 3: `http://localhost:30002`
- Node 4: `http://localhost:40002`

Ikuti panduan ini untuk mengeluarkan perintah operator ke klaster yang baru dibangun: [Cara melakukan kueri informasi operator](/docs/edge/working-with-node/query-operator-info) (port GRPC untuk klaster yang telah dibangun adalah `10000`/`20000`/`30000`/`40000` untuk setiap node masing-masing)
