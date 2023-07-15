---
id: set-up-ibft-on-the-cloud
title: Pengaturan Cloud
description: "Panduan pengaturan cloud secara bertahap."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Panduan ini untuk pengaturan mainnet atau testnet

Panduan di bawah ini akan menguraikan cara menyiapkan jaringan Polygon Edge di penyedia cloud untuk penyiapan produksi testnet atau mainnet.

Jika Anda ingin menyiapkan jaringan Polygon Edge secara lokal untuk menguji `polygon-edge` sekilas sebelum melakukan pengaturan untuk produksi, silakan lihat
**[Pengaturan](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Persyaratan {#requirements}

Baca [Instalasi](/docs/edge/get-started/installation) untuk menginstal Polygon Edge.

### Menyiapkan konektivitas VM {#setting-up-the-vm-connectivity}

Tergantung pada pilihan penyedia cloud, Anda dapat menyiapkan konektivitas dan aturan antara VM menggunakan firewall,
grup keamanan, atau daftar kontrol akses.

Karena satu-satunya bagian dari `polygon-edge` yang perlu diekspos ke VM lainnya adalah server libp2p, maka izinkan
semua komunikasi antara VM di port `1478` libp2p default.

## Ikhtisar {#overview}

![Pengaturan cloud](/img/edge/ibft-setup/cloud.svg)

Dalam panduan ini, tujuan kita adalah membangun jaringan blockchain `polygon-edge` yang bekerja dengan [protokol konsensus IBFT](https://github.com/ethereum/EIPs/issues/650).
Jaringan blockchain akan terdiri dari 4 node yang keempatnya merupakan node validator dan sebagai syarat untuk mengusulkan dan memvalidasi blok yang berasal dari proposal lain.
Masing-masing dari 4 node tersebut akan berjalan di VM masing-masing, karena gagasan dari panduan ini adalah memberikan jaringan Polygon Edge yang berfungsi sepenuhnya sekaligus menjaga kerahasiaan kunci validator guna memastikan pengaturan jaringan nirkepercayaan.

Untuk mencapai hal tersebut, kami memandu Anda dengan 4 langkah mudah berikut:

0. Perhatikan daftar **Persyaratan** di atas
1. Buat kunci privat untuk setiap validator dan lakukan inisialisasi pada direktori data
2. Siapkan string koneksi untuk bootnode yang akan dimasukkan ke `genesis.json` bersama
3. Buat `genesis.json` di mesin lokal dan kirim/transfer ke setiap node
4. Mulai semua node

:::info Jumlah validator

Tidak ada jumlah node minimum dalam sebuah klaster, artinya, sebuah klaster dapat memiliki hanya 1 node validator.
Ingat bahwa dengan klaster node _tunggal_, maka **tidak ada toleransi kerusakan** dan **tidak ada jaminan BFT**.

Jumlah node minimum yang direkomendasikan untuk bisa mendapatkan jaminan BFT adalah 4 - karena dalam sebuah klaster 4 node, kegagalan
1 node dapat ditoleransi, dengan sisa 3 node yang berfungsi normal.

:::

## Langkah 1: Inisialisasi folder data dan buat kunci validator {#step-1-initialize-data-folders-and-generate-validator-keys}

Untuk menyiapkan dan menjalankan Polygon Edge, Anda perlu menginisialisasi folder data pada setiap node:


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

Setiap perintah ini akan mencetak kunci validator, kunci publik bls, dan [ID node](https://docs.libp2p.io/concepts/peer-id/). Anda akan membutuhkan ID Node dari node pertama untuk langkah berikutnya.

### Menampilkan Rahasia {#outputting-secrets}
Output rahasia dapat diakses lagi, jika diperlukan.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Simpan direktori data Anda untuk diri sendiri!

Direktori data dihasilkan di atas, selain menginisialisasi direktori untuk menyimpan kondisi blockchain, juga akan menghasilkan kunci privat validator.
**Kunci ini harus disimpan dan dirahasiakan, karena jika dicuri seseorang, orang tersebut dapat menyamar sebagai Anda untuk menjadi validator dalam jaringan!**

:::

## Langkah 2: Siapkan string koneksi multiaddr untuk bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Agar berhasil membangun konektivitas, node harus tahu server `bootnode` mana yang harus dihubungkan untuk mendapatkan
informasi tentang semua node yang tersisa pada jaringan. `bootnode` kadang juga dikenal sebagai server `rendezvous` dalam jargon p2p.

`bootnode` bukan instans khusus node Polygon Edge. Setiap node Polygon Edge dapat berfungsi sebagai `bootnode` dan
setiap node Polygon Edge perlu memiliki set bootnode yang ditentukan dan akan dihubungi untuk memberikan informasi tentang cara terhubung dengan
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
Dalam panduan ini kami akan mencantumkan dua node, tetapi ini dapat diubah dengan cepat tanpa berdampak pada validitas file `genesis.json`.

:::

Karena bagian pertama string koneksi multiaddr adalah `<ip_address>`, di sini Anda perlu memasukkan alamat IP yang dapat dicapai oleh node lain, tergantung pengaturan Anda, alamat tersebut bisa berupa alamat IP privat atau publik, bukan `127.0.0.1`.

Untuk `<port>`, kita akan menggunakan `1478`, karena itu pengaturan default untuk port libp2p.

Terakhir, kita membutuhkan `<node_id>` yang bisa didapatkan dari output perintah yang dijalankan sebelumnya, yakni perintah `polygon-edge secrets init --data-dir data-dir` (yang digunakan untuk menghasilkan kunci dan direktori data untuk `node 1`)

Setelah perakitan, string koneksi multiaddr ke `node 1` yang akan kita gunakan sebagai bootnode akan terlihat seperti ini (hanya `<node_id>` yang pada akhirnya akan berbeda):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Demikian juga, kita membangun multiaddr untuk bootnode kedua seperti yang ditunjukkan di bawah
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info Nama host DNS, bukan ips

Polygon Edge mendukung penggunaan nama host DNS untuk konfigurasi node. Ini fitur yang sangat membantu untuk penyebaran berbasis cloud, sebab ip node dapat berubah karena berbagai alasan.

Format multiaddr untuk string koneksi saat menggunakan nama host DNS adalah sebagai berikut:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Langkah 3: Menghasilkan file genesis dengan 4 node sebagai validator {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Langkah ini dapat dijalankan di mesin lokal, tetapi Anda akan membutuhkan kunci validator untuk masing-masing dari 4 validator.

Validator dapat dengan aman berbagi `Public key (address)` seperti yang ditunjukkan di bawah ini dalam keluaran untuk perintah `secrets init`, sehingga
Anda dapat secara aman menghasilkan genesis.json dengan validator tersebut di set validator awal, yang diidentifikasi oleh kunci publiknya:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Mengingat Anda telah menerima keempat kunci publik validator, maka Anda dapat menjalankan perintah berikut untuk menghasilkan `genesis.json`

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Yang dilakukan perintah ini:

* `--ibft-validator` menetapkan kunci publik validator yang harus dimasukkan dalam set validator awal yang ditetapkan dalam blok genesis. Jumlah validator awal bisa lebih dari satu.
* `--bootnode` mengatur alamat bootnode yang akan memungkinkan node untuk bisa saling menemukan.
`node 1`Kami akan menggunakan string multiaddr dari , seperti yang disebutkan di **langkah 2**, meskipun Anda dapat menambahkan berapa pun jumlah bootnode yang Anda inginkan, seperti yang ditunjukkan di atas.

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
Batas itu harus diatur ke nilai yang ditentukan dalam file limits.conf.

:::

Setelah menentukan:
1. Kunci publik validator yang akan dimasukkan dalam blok genesis sebagai set validator
2. String koneksi multiaddr bootnode
3. Akun dan saldo pratambang yang akan dimasukkan dalam blok genesis

dan yang menghasilkan `genesis.json` harus disalin ke semua VM dalam jaringan. Tergantung pengaturan, Anda dapat
menyalin/menempelnya, mengirimkannya ke operator node, atau hanya melakukan SCP/FTP.

Struktur file genesis dibahas pada bagian [Perintah CLI.](/docs/edge/get-started/cli-commands).

## Langkah 4: Jalankan semua klien {#step-4-run-all-the-clients}

:::note Jaringan pada Penyedia Cloud

Kebanyakan penyedia cloud tidak mengekspos alamat IP (terutama alamat IP publik) sebagai antarmuka jaringan langsung pada VM, tetapi menyiapkan NAT proxy yang tidak terlihat.


Dalam kasus ini, untuk memungkinkan node saling terhubung, Anda perlu mendengarkan alamat IP `0.0.0.0` agar terikat pada semua antarmuka, tetapi Anda akan tetap perlu menentukan alamat IP atau alamat DNS yang dapat digunakan node lain untuk terhubung ke instans. Hal ini bisa dicapai dengan menggunakan argumen `--nat` atau `--dns` dengan menentukan alamat IP atau DNS eksternal.

#### Contoh {#example}

Alamat IP terkait yang ingin Anda dengarkan adalah `192.0.2.1`, tetapi alamat itu tidak terikat langsung ke antarmuka jaringan.

Agar node-node tersebut dapat terhubung, Anda harus memberikan parameter berikut:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Atau, jika Anda ingin menentukan alamat DNS `dns/example.io`, berikan parameter berikut:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Ini akan membuat node mendengarkan semua antarmuka, tetapi juga membuatnya mengetahui bahwa klien terhubung padanya melalui alamat `--nat` atau `--dns` yang ditentukan.

:::

Untuk menjalankan klien **pertama**:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Untuk menjalankan klien **kedua**:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Untuk menjalankan klien **ketiga**:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Untuk menjalankan klien **keempat**:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Setelah menjalankan perintah-perintah tersebut, Anda telah selesai mengatur jaringan Polygon Edge 4 node, dapat menyegel blok, dan melakukan pemulihan
dari kegagalan node.

:::info Mulai klien menggunakan file konfigurasi

Alih-alih menentukan semua parameter konfigurasi sebagai argumen CLI, Klien juga dapat dimulai menggunakan file konfigurasi dengan menjalankan perintah berikut:

````bash
polygon-edge server --config <config_file_path>
````
Contoh:

````bash
polygon-edge server --config ./test/config-node1.json
````
Saat ini, kami hanya mendukung file konfigurasi berbasis `json`, berkas konfigurasi sampel dapat ditemukan **[di sini](/docs/edge/configuration/sample-config)**

:::

:::info Langkah-langkah untuk menjalankan node nonvalidator

Node nonvalidator akan selalu menyinkronkan blok terakhir yang diterima dari node validasi, Anda dapat memulai node nonvalidator dengan menjalankan perintah berikut.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Misalnya, Anda dapat menambahkan klien Nonvalidator **kelima** dengan menjalankan perintah berikut:

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Menentukan batas harga

Node Polygon Edge dapat dimulai dengan set **batas harga** untuk transaksi masuk.

Unit batas harga adalah `wei`.

Mengatur batas harga berarti transaksi apa pun yang diproses oleh node saat ini harus memiliki harga gas yang **lebih tinggi**
dari batas harga yang ditentukan, jika tidak, maka tidak akan dimasukkan ke dalam sebuah blok.

Dengan membuat mayoritas node mematuhi batas harga tertentu akan memaksa berlakunya aturan bahwa transaksi dalam jaringan
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
