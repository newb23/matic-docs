---
id: blockscout
title: Blockscout
description: Cara mengatur instans Blockscout agar berfungsi dengan Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Ikhtisar {#overview}
Panduan ini menjelaskan perincian cara mengompilasi dan menyebar instans Blockscout agar berfungsi dengan Polygon-Edge.
Blockscout memiliki [dokumentasi](https://docs.blockscout.com/for-developers/manual-deployment) sendiri, tetapi panduan ini berfokus pada instruksi langkah yang sederhana, tetapi mendetail tentang cara mengatur instans Blockscout.

## Lingkungan {#environment}
* Sistem Operasi: Ubuntu Server 20.04 LTS [tautan unduhan](https://releases.ubuntu.com/20.04/) dengan izin sudo
* Perangkat Keras Server:  8 CPU / RAM 16 GB / HDD 50 GB (LVM)
* Server Pangkalan Data:  Server khusus dengan 2 CPU / RAM 4 GB / SSD 100 GB / PostgreSQL 13.4

### Server DB {#db-server}
Syarat untuk mengikuti panduan ini adalah server pangkalan data yang siap pakai, pangkalan data dan pengguna telah dikonfigurasi
Panduan ini tidak akan menjelaskan cara menyebar dan mengkonfigurasi server PostgreSQL.
Ada banyak panduan untuk melakukan hal ini, misalnya [Panduan DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info PENAFIAN
Panduan ini hanya untuk membantu Anda menjalankan Blockscout pada instans tunggal yang bukan pengaturan produksi yang ideal.   
Untuk produksi, Anda mungkin ingin memperkenalkan proksi terbalik, penyeimbang beban, pilihan skalabilitas, dll. ke dalam arsitektur.

:::

# Prosedur Penyebaran Blockscout {#blockscout-deployment-procedure}

## Bagian 1 - instal dependensi {#part-1-install-dependencies}
Sebelum memulai, kita perlu memastikan semua biner sudah terinstal yang menjadi dependensi blockscout.

### Memperbarui & meningkatkan sistem {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Tambah repo erlang {#add-erlang-repos}
```bash
# go to your home dir
cd ~
# download deb
wget https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb
# download key
wget https://packages.erlang-solutions.com/ubuntu/erlang_solutions.asc
# install repo
sudo dpkg -i erlang-solutions_2.0_all.deb
# install key
sudo apt-key add erlang_solutions.asc
# remove deb
rm erlang-solutions_2.0_all.deb
# remove key
rm erlang_solutions.asc
```

### Tambah repo NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Instal Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Instal versi Erlang yang dibutuhkan {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Instal versi Elixir yang dibutuhkan {#install-required-version-of-elixir}
Versi Elixir harus `1.13`. Jika menginstal versi ini dari repo resmi,
`erlang` akan memperbarui ke `Erlang/OTP 25` dan kita tidak menginginkan hal itu.     
Maka kita perlu menginstal versi yang `elixir` telah dikompilasi khusus dari halaman rilis GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Sekarang kita perlu mengatur biner sistem `exlixir` dengan benar.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Jalankan `elixir -v` untuk memeriksa apakah `erlang` dan `elixir` telah diinstall dengan benar.
Hasilnya akan seperti ini:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning
`Erlang/OTP`harus versi  `24`dan `Elixir`harus versi .`1.13.*`     Jika itu bukan kasusnya, Anda akan jalankan ke isu dengan mengkompilasi Blockscout dan/atau menjalankannya.
:::   
:::info
Periksa ***[halaman persyaratan Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)*** resmi
:::

### Install NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Instal Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### Instal dependensi lainnya {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Secara opsional, instal klien postgresql untuk memeriksa koneksi db {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Bagian 2 - atur variabel lingkungan {#part-2-set-environment-variables}
Sebelum memulai kompilasi Blockscout, kita perlu mengatur variabel lingkungan. Dalam panduan ini kita hanya akan mengatur minimum dasar untuk membuatnya bekerja. Daftar lengkap variabel yang dapat diatur ada [di sini](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)

### Atur koneksi pangkalan data sebagai variabel lingkungan {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Sekarang, tes koneksi DB dengan parameter yang tersedia.
Karena Anda menyediakan PG env vars, Anda akan dapat menghubungkan ke pangakalan data hanya dengan menjalankan:
```bash
psql
```

Jika pangkalan data dikonfigurasi dengan benar, Anda akan melihat baris perintah psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Jika tidak, Anda mungkin melihat error seperti ini:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Jika hal ini terjadi, [dokumen ini](https://ubuntu.com/server/docs/databases-postgresql) mungkin dapat membantu Anda.

:::info Koneksi DB

Pastikan Anda telah menyelesaikan semua isu koneksi sebelum melanjutkan ke bagian selanjutnya.
Anda perlu untuk menyediakan hak istimewa pengguna super untuk pengguna blockscout.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Bagian 3 - mengkloning dan mengompilasi Blockscout {#part-3-clone-and-compile-blockscout}
Sekarang kita akhirnya dapat mulai instalasi Blockscout.

### Mengkloning repo Blockscout {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Buat basis kunci rahasia untuk melindungi build produksi {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
Pada baris yang terakhir, Anda akan melihat string panjang yang berisi karakter acak.     
Ini akan diatur sebagai variabel lingkungan `SECRET_KEY_BASE`, sebelum langkah selanjutnya.     
Misalnya:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Atur mode produksi {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Mengompilasi {#compile}
Cd ke direktori klona dan mulai kompilasi

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Jika sudah disebarkan, hilangkan aset statis dari build ***mix phx.digest.clean*** sebelumnya.

:::

### Memigrasi pangkalan data {#migrate-databases}
:::info

Bagian ini akan gagal jika Anda tidak mengatur koneksi DB dengan benar, tidak menyediakan parameter,
atau menentukan parameter yang salah pada variabel lingkungan DATABASE_URL.
Pengguna pangkalan data harus memiliki hak istimewa superuser.

:::
```bash
mix do ecto.create, ecto.migrate
```

Jika Anda harus mengeluarkan pangkalan data terlebih dahulu, jalankan
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Instal dependensi npm dan kompilasikan aset frontend {#install-npm-dependencies-and-compile-frontend-assets}
Anda harus mengubah direktori ke folder yang berisi aset frontend.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Mohon bersabar

Kompilasi aset dapat memerlukan waktu beberapa menit dan tidak akan menampilkan output.
Ini dapat terlihat seperti proses yang macet, tetapi tetap bersabar.
Ketika proses kompilasi selesai, outpu akan seperti: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### Aset statis build {#build-static-assets}
Untuk langkah ini, Anda harus kembali ke root folder klona Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Buat sertifikat yang ditandatangani sendiri {#generate-self-signed-certificates}
:::info
Anda dapat melewatkan langkah ini jika Anda tidak akan menggunakannya `https`.
:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Bagian 4 - buat dan jalankan layanan Blockscout {#part-4-create-and-run-blockscout-service}
Di bagian ini kita perlu mengatur layanan sistem karena kita ingin Blockscout jalankan di latar belakang dan bertahan setelah sistem reboot.

### Buat file layanan {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Edit file layanan {#edit-service-file}
Gunakan editor teks linux favorit Anda untuk mengedit file ini dan konfigurasikan layanan.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Isi file explorer.service akan terlihat seperti ini:
```bash
[Unit]
Description=BlockScout Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=root
StandardOutput=syslog
StandardError=syslog
WorkingDirectory=/usr/local/blockscout
ExecStart=/usr/local/bin/mix phx.server
EnvironmentFile=/usr/local/blockscout/env_vars.env

[Install]
WantedBy=multi-user.target
```

### Aktifkan layanan awal di boot sistem {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Pindah folder klon Blockscout Anda ke lokasi seluruh sistem {#move-your-blockscout-clone-folder-to-system-wide-location}
Layanan Blockscout perlu memiliki akses ke folder yang telah Anda kloning dari repo Blockscout dan mengkompilasi semua aset.
```bash
sudo mv ~/blockscout /usr/local
```

### Buat file env vars yang akan digunakan oleh layanan Blockscout {#create-env-vars-file-which-will-be-used-by-blockscout-service}

```bash
sudo touch /usr/local/blockscout/env_vars.env
# use your favorite text editor
sudo vi /usr/local/blockscout/env_vars.env

# env_vars.env file should hold these values ( adjusted for your environment )
ETHEREUM_JSONRPC_HTTP_URL="localhost:8545"  # json-rpc API of the chain
ETHEREUM_JSONRPC_TRACE_URL="localhost:8545" # same as json-rpc API
DATABASE_URL='postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout' # database connection from Step 2
SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/" # secret key base
ETHEREUM_JSONRPC_WS_URL="ws://localhost:8545/ws" # websocket API of the chain
CHAIN_ID=93201 # chain id
HEART_COMMAND="systemctl restart explorer" # command used by blockscout to restart it self in case of failure
SUBNETWORK="Supertestnet PoA" # this will be in html title
LOGO="/images/polygon_edge_logo.svg" # logo location
LOGO_FOOTER="/images/polygon_edge_logo.svg" # footer logo location
COIN="EDGE" # coin
COIN_NAME="EDGE Coin" # name of the coin
INDEXER_DISABLE_BLOCK_REWARD_FETCHER="true" # disable block reward indexer as Polygon Edge doesn't support tracing
INDEXER_DISABLE_PENDING_TRANSACTIONS_FETCHER="true" # disable pending transactions indexer as Polygon Edge doesn't support tracing
INDEXER_DISABLE_INTERNAL_TRANSACTIONS_FETCHER="true" # disable internal transactions indexer as Polygon Edge doesn't support tracing
MIX_ENV="prod" # run in production mode
BLOCKSCOUT_PROTOCOL="http" # protocol to run blockscout web service on
PORT=4000 # port to run blockscout service on
DISABLE_EXCHANGE_RATES="true" # disable fetching of exchange rates
POOL_SIZE=200 # the number of database connections
POOL_SIZE_API=300 # the number of read-only database connections
ECTO_USE_SSL="false" # if protocol is set to http this should be false
HEART_BEAT_TIMEOUT=60 # run HEARTH_COMMAND if heartbeat missing for this amount of seconds
INDEXER_MEMORY_LIMIT="10Gb" # soft memory limit for indexer - depending on the size of the chain and the amount of RAM the server has
FETCH_REWARDS_WAY="manual" # disable trace_block query
INDEXER_EMPTY_BLOCKS_SANITIZER_BATCH_SIZE=1000 # sanitize empty block in this batch size
```
:::info

Gunakan `SECRET_KEY_BASE` yang telah Anda buat di Bagian 3.

:::Simpan file dan keluar.

### Akhirnya, mulai layanan Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Bagian 5 - tes fungsi instance Blockscout Anda {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Sekarang yang harus dilakukan tinggal periksa apakah layanan Blockscout berjalan. Periksa status layanan dengan:
```bash
sudo systemctl status explorer.service
```

Untuk memeriksa output layanan:
```bash
sudo journalctl -u explorer.service -f
```

Anda dapat memeriksa apakah ada port mendengarkan baru:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Anda harus mendapatkan daftar port mendengarkan dan di daftar itu harus ada sesuatu seperti ini:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Layanan web Blockscout menjalankan port dan protokol yang ditentukan di file env. Dalam contoh ini itu jalankan di `4000`(http).    Jika semuanya normal, Anda akan dapat mengakses portal web Blockscout dengan `http://<host_ip>:4000`.

## Pertimbangan {#considerations}
Untuk kinerja terbaik, itu disarankan memiliki node non validator arsip penuh `polygon-edge`yang berdedikasi/lokal yang akan digunakan secara eksklusif untuk query Blockscout.     API `json-rpc` dari node ini, tidak perlu diekspos secara publik, karena Blockscout jalankan semua query dari backend.


## Pemikiran akhir {#final-thoughts}
Kita telah meluncurkan instans Blockscout tunggal yang beroperasi dengan baik, tetapi untuk produksi, Anda harus mempertimbangkan penempatan instans ini di belakang proxy terbalik seperti Nginx.
Anda juga harus memikirkan basis data dan skalabilitas instance, tergantung pada kasus pengguna Anda.

Anda harus memeriksa [dokumentasi Blockscout](https://docs.blockscout.com/) resmi karena ada banyak opsi kustomisasi.