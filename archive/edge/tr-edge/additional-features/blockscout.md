---
id: blockscout
title: Blockscout
description: Blockscout oturumu Polygon Edge ile çalışacak şekilde nasıl yapılandırılır?
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Genel Bakış {#overview}
Bu kılavuz, Blackscout oturumunun Polygon-Edge ile birlikte çalışacak şekilde nasıl derleneceğini ve devreye alınacağını ayrıntılarıyla ele alır.
Blockscout'un kendi [belgeleri](https://docs.blockscout.com/for-developers/manual-deployment) bulunmaktadır; ancak bu kılavuz Blockscout oturumunun nasıl yapılandırılacağına dair basit ama adım adım ayrıntılı talimatlara odaklanır.

## Ortam {#environment}
* İşletim Sistemi: Ubuntu Server 20.04 LTS sudo izinleri içeren [indirme bağlantısı](https://releases.ubuntu.com/20.04/)
* Sunucu Donanımı: 8CPU / 16GB RAM / 50GB HDD (LVM)
* Veri Tabanı Sunucusu: 2 CPU / 4GB RAM / 100GB SSD / PostgreSQL 13.4 özellikli ayrılmış sunucu

### DB Sunucusu {#db-server}
Bu kılavuza uymak için gereksinim, bir veri tabanı sunucusu hazır bulundurulması ve veri tabanı ile veri tabanı kullanıcısının yapılandırılmış olmasıdır.
Bu kılavuz PostgreSQL sunucusunun nasıl devreye alınacağı ve yapılandırılacağı hakkında ayrıntılara girmeyecektir.
Bunun nasıl yapılacağı ile ilgili birçok kılavuz mevcuttur; örneğin [DigitalOcean Kılavuzu](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info YASAL UYARI

Bu kılavuz, Blockscout'u idal üretim kurulumu olmayan tek bir oturumda çalışır hâle getirmenize yardımcı olmaya yöneliktir.   
Üretim için muhtemelen mimari içine ters proxy, yük dengeleyici, ölçeklenebilirlik seçenekleri vb. eklemek isteyeceksiniz.

:::

# Blockscout Devreye Alma Prosedürü {#blockscout-deployment-procedure}

## Bölüm 1 - Bağımlılıkları kurun {#part-1-install-dependencies}
Başlamadan önce, blockscout'un bağımlı olduğu tüm ikili dosyaları kurduğumuzdan emin olmamız gerekir.

### Sistemi güncelleyin ve yükseltin {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Erlang bilgi depolarını ekleyin {#add-erlang-repos}
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

### NodeJS bilgi depolarını ekleyin {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Rust kurun {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Erlang için gerekli sürümü kurun {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Elixir için gerekli sürümü kurun {#install-required-version-of-elixir}
Elixir sürümü `1.13` olmalıdır. Bu sürümü resmî bilgi deposundan kurmayı denersek,
`erlang`, `Erlang/OTP 25` sürümüne güncellenecektir ve bu istemediğimiz bir durumdur     .
Bu yüzden önceden derlenmiş özel `elixir` sürümünü GitHub sürümler sayfasından alarak kurmamız gerekir.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Şimdi `exlixir` sistemi ikili dosyalarını doğru bir şekilde yapılandırmamız gerekiyor.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

`elixir` ve `erlang` için kurulumun doğru bir şekilde yapılıp yapılmadığını `elixir -v` çalıştırarak kontrol edin.
Çıktı şu şekilde olmalıdır:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

`Erlang/OTP` sürümü `24` olmalı ve `Elixir` sürümü `1.13.*` olmalıdır.    
Aksi halde Blockscout derlemesi yaparken ve/veya çalıştırırken sorunlarla karşılaşırsınız.

:::   
:::info

Resmî ***[Blockscout gereksinimler sayfasına](https://docs.blockscout.com/for-developers/information-and-settings/requirements)*** göz atın

:::

### NodeJS kurun {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Cargo kurun {#install-cargo}
```bash
sudo apt -y install cargo
```

### Diğer bağımlılıkları kurun {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Veri tabanı bağlantınızı denetlemek için isteğe bağlı olarak postgresql istemcisini kurun {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Bölüm 2 - Ortam değişkenlerini ayarlayın {#part-2-set-environment-variables}
Blockscout derlemesine başlamadan önce ortam değişkenlerini ayarlamamız gerekir.
Bu kılavuzda yalnızca çalışmasını sağlamak için temel yapılandırmaları yapacağız.
Ayarlanabilir değişkenlerin tam bir listesini [burada](https://docs.blockscout.com/for-developers/information-and-settings/env-variables) bulabilirsiniz

### Veri tabanını ortam değişkeni olarak belirleyin {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Şimdi sağlanan parametrelerle veri tabanı bağlantınızı test edin.
PG ortam değişkenlerini sağladığınıza göre, veri tabanına yalnızca şunu çalıştırarak bağlanabiliyor olmanız gerekir:
```bash
psql
```

Veri tabanı doğru bir şekilde yapılandırıldığında bir psql istemi görmeniz gerekir:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Aksi takdirde aşağıdaki gibi bir hata görebilirsiniz:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Bu durumda [bu belgeler](https://ubuntu.com/server/docs/databases-postgresql) size yardımcı olabilir.

:::info Veri tabanı bağlantısı

Bir sonraki bölüme geçmeden önce tüm veri tabanı bağlantı sorunlarını çözdüğünüzden emin olun.
Blockscout kullanıcısı için süper kullanıcı ayrıcalıkları sağlamanız gerekir.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Bölüm 3 - Blockscout'u klonlayın ve derleyin {#part-3-clone-and-compile-blockscout}
Şimdi en sonunda Blockscout kurulumuna başlıyoruz.

### Blockscout bilgi deposunu klonlayın {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Üretim derlemesini korumak için gizli anahtar tabanını oluşturun {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
Son satırda rastgele karakterlerden oluşan uzun bir dize görmeniz gerekir.     
Bu, bir sonraki adımdan önce `SECRET_KEY_BASE` ortam değişkeniniz olarak ayarlanmalıdır.     
Örneğin:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Üretim modunu ayarlayın {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Derleyin {#compile}
Klon dizinine girin ve derlemeye başlayın

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Daha önce kurulum gerçekleştirdiyseniz, statik varlıkları önceki derlemeden kaldırın ***mix phx.digest.clean***.

:::

### Veri tabanlarını taşıyın {#migrate-databases}
:::info

Veri tabanı bağlantınızı doğru bir şekilde yapılandırmadıysanız,
veya DATABASE_URL ortam değişkenini sağlamadıysanız ya da yanlış parametrelerle tanımladıysanız bu bölüm başarısız olacaktır.
Veri tabanı kullanıcısının süper kullanıcı ayrıcalıklarına sahip olması gerekir.

:::
```bash
mix do ecto.create, ecto.migrate
```

Önce veri tabanını bırakmanız gerekiyorsa, şunu çalıştırın:
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Npm bağımlılıklarını kurun ve ön uç varlıklarını derleyin {#install-npm-dependencies-and-compile-frontend-assets}
Dizini ön uç varlıklarını içeren klasör olacak şekilde değiştirmeniz gerekir.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Lütfen bekleyin

Bu varlıkların derlenmesi birkaç dakika sürebilir ve herhangi bir çıktı göstermez.
İşlem takılmış gibi görünebilir ama sabırlı olmalısınız.
Derleme işlemi tamamlandığında, aşağıdaki gibi bir çıktı vermelidir: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### Statik varlıkları oluşturun {#build-static-assets}
Bu adım için Blockscout klon klasörünüzün köküne geri dönmeniz gerekir.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Kendinden imzalı sertifikalar oluşturun {#generate-self-signed-certificates}
:::info

`https` kullanmayacaksanız bu adımı atlayabilirsiniz.

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Bölüm 4 - Blockscout hizmetini oluşturun ve çalıştırın {#part-4-create-and-run-blockscout-service}
Bu bölümde Blockscout'un arka planda çalışmasını ve sistemi yeniden başlattıktan sonra çalışmaya devam etmesini istediğimiz için bir sistem hizmeti kurmamız gerekir.

### Hizmet dosyası oluşturun {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Hizmet dosyasını düzenleyin {#edit-service-file}
Bu dosyayı düzenlemek ve hizmeti yapılandırmak için en sık kullandığınız linux metin editörünü kullanın.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Explorer.service dosyasının içeriği şuna benzemelidir:
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

### Sistem önyükleme sırasında hizmet başlatmayı etkinleştirin {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Blockscout klon klasörünüzü system-wide konumuna taşıyın {#move-your-blockscout-clone-folder-to-system-wide-location}
Blockscout hizmetinin Blockscout bilgi deposundan klonladığınız klasöre erişmesi ve tüm varlıkları derlemiş olması gerekir.
```bash
sudo mv ~/blockscout /usr/local
```

### Blockscout hizmeti tarafından kullanılacak ortam değişkenleri dosyasını oluşturun {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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

Bölüm 3'te oluşturduğunuz `SECRET_KEY_BASE`'i kullanın.

:::
Dosyayı kaydedin ve çıkın.

### Son olarak, Blockscout hizmetini başlatın {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Bölüm 5 - Blockscout örneğinizin işlevselliğini test edin {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Şimdi tek yapmanız gereken, Blockscout hizmetinin çalışıp çalışmadığını kontrol etmektir.
Hizmet durumunu kontrol etmek için:
```bash
sudo systemctl status explorer.service
```

Hizmet çıktısını kontrol etmek için:
```bash
sudo journalctl -u explorer.service -f
```

Yeni dinleme portları olup olmadığını kontrol edebilirsiniz:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Dinleme portlarının bir listesini almanız gerekir ve listede şuna benzer bir şey yer almalıdır:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Blockscout ortam dosyası içinde tanımlanan web hizmeti portu ve protokolü çalıştırır. Bu örnekte `4000`(http)    üzerinde çalışır.
Her şey yolunda ise, Blockscout web portalına `http://<host_ip>:4000` ile erişebilirsiniz.

## Dikkate Alınacak Konular {#considerations}
En iyi performans için, özel/yerel bir `polygon-edge` doğrulayıcı olmayan tam arşivli bir düğüme sahip olunması
ve bu düğümün sadece Blockscout sorguları için kullanılması tavsiye edilir.    
Bu düğümün `json-rpc` API'sinin herkese açık hâle getirilmesi gerekmez çünkü Blockscout tüm sorguları arka uçtan çalıştırır.


## Son olarak {#final-thoughts}
Düzgün bir şekilde çalışan tek bir Blockscout oturumunu az önce devreye aldık; ancak üretim için bu oturumu Nginx gibi bir ters proxy arkasına yerleştirmeyi değerlendirmelisiniz.
Ayrıca kullanım durumunuza bağlı olarak veri tabanı ve örnek ölçeklenebilirliği hakkında da düşünmelisiniz.

Birçok özelleştirme seçeneği bulunan resmî [Blockscout belgelerine](https://docs.blockscout.com/) mutlaka göz atmalısınız.