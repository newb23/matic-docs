---
id: blockscout
title: Blockscout
description: วิธีตั้งค่าอินสแตนซ์ Blockscout ให้ทำงานกับ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## ภาพรวม {#overview}
คู่มือนี้มีรายละเอียดเกี่ยวกับวิธีคอมไพล์และปรับใช้อินสแตนซ์ Blockscout เพื่อทำงานกับ Polygon-EdgeBlockscout มี[เอกสารประกอบ](https://docs.blockscout.com/for-developers/manual-deployment)ของตัวเอง แต่คู่มือนี้จะเน้นไปที่คำแนะนำทีละขั้นตอนอย่างละเอียดและเรียบง่ายเกี่ยวกับวิธีตั้งค่าอินสแตนซ์ Blockscout

## สภาพแวดล้อม {#environment}
* ระบบปฏิบัติการ: Ubuntu Server 20.04 LTS [ลิงก์สำหรับดาวน์โหลด](https://releases.ubuntu.com/20.04/) พร้อมสิทธิ์ Sudo
* ฮาร์ดแวร์เซิร์ฟเวอร์: 8CPU / 16GB RAM / HDD 50GB (LVM)
* เซิร์ฟเวอร์ฐานข้อมูล: เซิร์ฟเวอร์เฉพาะที่มี 2 CPU / 4GB RAM / 100GB SSD / PostgreSQL 13.4

### เซิร์ฟเวอร์ DB {#db-server}
ข้อกำหนดสำหรับการปฏิบัติตามคู่มือนี้คือ ต้องมีเซิร์ฟเวอร์ฐานข้อมูลพร้อมใช้ และกำหนดค่าฐานข้อมูลและผู้ใช้ฐานข้อมูลไว้แล้วคู่มือนี้จะไม่ลงรายละเอียดเกี่ยวกับวิธีปรับใช้และกำหนดค่าเซิร์ฟเวอร์ PostgreSQLมีคู่มือมากมายในการทำเช่นนี้ ตัวอย่างเช่น [คู่มือ DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info ข้อจำกัดความรับผิดชอบ
คู่มือนี้จัดทำขึ้นเพื่อช่วยคุณรับและติดตั้ง Blockscout และรันบนอินสแตนซ์เดียวเท่านั้น ซึ่งไม่ใช่การตั้งค่าสำหรับการใช้งานที่เอื้ออำนวยนัก   สำหรับการใช้งานจริง คุณอาจต้องการเพิ่มพร็อกซีย้อนกลับ โหลดบาลานเซอร์ ตัวเลือกความสามารถในการปรับขนาด ฯลฯ เข้าในสถาปัตยกรรม
:::

# ขั้นตอนปรับใช้ Blockscout {#blockscout-deployment-procedure}

## ส่วนที่ 1 - ติดตั้งรูปแบบการขึ้นต่อกัน {#part-1-install-dependencies}
ก่อนเริ่ม เราจำเป็นต้องตรวจสอบให้แน่ใจว่า เราได้ติดตั้งไบนารีทั้งหมดที่ Blockscout ต้องใช้แล้ว

### อัปเดตและอัปเกรดระบบ {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### เพิ่มพื้นที่เก็บข้อมูล erlang {#add-erlang-repos}
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

### เพิ่มพื้นที่เก็บข้อมูล NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### ติดตั้ง Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### ติดตั้ง Erlang เวอร์ชันที่กำหนด {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### ติดตั้ง Elixir เวอร์ชันที่กำหนด {#install-required-version-of-elixir}
เวอร์ชัน Elixir ต้องเป็น `1.13`หากเราพยายามติดตั้งเวอร์ชันนี้จากพื้นที่เก็บข้อมูลที่เป็นทางการ`erlang` จะอัปเดตเป็น `Erlang/OTP 25` ซึ่งเราไม่ต้องการอย่างนั้น     ด้วยเหตุนี้ เราจึงต้องติดตั้งเวอร์ชัน `elixir` ที่คอมไพล์ไว้ล่วงหน้าโดยเฉพาะจากหน้าการเผยแพร่ GitHub

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

ตอนนี้ เราต้องตั้งค่าระบบไบนารี `exlixir`อย่างถูกต้อง
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

ตรวจว่าติดตั้ง `elixir` และ `erlang` ถูกต้องหรือไม่ โดยเรียกใช้ `elixir -v`ควรเป็นเอาต์พุต:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

`Erlang/OTP` ต้องเป็นเวอร์ชัน `24` และ `Elixir` ต้องเป็นเวอร์ชัน `1.13.*`     หากไม่เป็นเช่นนั้น คุณจะประสบปัญหาในการคอมไพล์และ/หรือเรียกใช้ Blockscout
:::   
:::info
ลองดู***[หน้าข้อกำหนดของ Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)*** อย่างเป็นทางการ
:::

### ติดตั้ง NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### ติดตั้ง Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### ติดตั้งรูปแบบการขึ้นต่อกันอื่นๆ {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### เลือกติดตั้งไคลเอ็นต์ postgresql เพื่อตรวจสอบการเชื่อมต่อฐานข้อมูลของคุณ {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## ส่วนที่ 2 - ตั้งค่าตัวแปรแวดล้อม {#part-2-set-environment-variables}
เราจำเป็นต้องตั้งค่าตัวแปรแวดล้อมก่อนเริ่มการคอมไพล์ Blockscoutในคู่มือนี้ เราจะตั้งค่าขั้นต่ำพื้นฐานเท่านั้นเพื่อให้ใช้งานได้คุณสามารถดูรายการตัวแปรทั้งหมดที่สามารถทำการตั้งค่าได้[ที่นี่](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)

### ตั้งค่าการเชื่อมต่อฐานข้อมูลเป็นตัวแปรแวดล้อม {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

คราวนี้ทดสอบการเชื่อมต่อฐานข้อมูลของคุณด้วยพารามิเตอร์ที่ให้มาเนื่องจากคุณได้จัดเตรียมตัวแปรแวดล้อม PG ไว้ คุณควรสามารถเชื่อมต่อกับฐานข้อมูลได้โดยเพียงแค่เรียกใช้:
```bash
psql
```

หากกำหนดค่าฐานข้อมูลอย่างถูกต้อง คุณควรเห็นพรอมต์ psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

หากกำหนดค่าไม่ถูกต้อง คุณอาจเห็นข้อผิดพลาดดังนี้:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
หากเป็นเช่นนั้น [เอกสารเหล่านี้](https://ubuntu.com/server/docs/databases-postgresql)อาจช่วยคุณได้

:::info การเชื่อมต่อฐานข้อมูล
ตรวจให้แน่ใจว่าคุณได้แยกแยะปัญหาการเชื่อมต่อฐานข้อมูลทั้งหมดก่อนดำเนินการในส่วนถัดไป คุณจะต้องให้สิทธิ์การใช้งาน Superuser แก่ผู้ใช้ Blockcout
:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## ส่วนที่ 3 - โคลนและคอมไพล์ Blockscout {#part-3-clone-and-compile-blockscout}
ในที่สุด ตอนนี้เราก็จะได้เริ่มติดตั้ง Blockscout แล้ว

### โคลนพื้นที่เก็บข้อมูล Blockscout {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### สร้างฐานคีย์ลับเพื่อปกป้องบิลด์สำหรับใช้งานจริง {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
ที่บรรทัดสุดท้าย คุณจะเห็นอักขระสุ่มเป็นสตริงยาว     ซึ่งควรตั้งค่าเป็นตัวแปรแวดล้อม `SECRET_KEY_BASE` ของคุณก่อนขั้นตอนถัดไป     ตัวอย่างเช่น:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### ตั้งค่าโหมดการใช้งานจริง {#set-production-mode}
```bash
export MIX_ENV=prod
```

### คอมไพล์ {#compile}
เปลี่ยนไปยังไดเรกทอรีโคลนและเริ่มคอมไพล์

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info
หากคุณได้ปรับใช้ก่อนหน้านี้ ให้ลบสินทรัพย์แบบคงที่ออกจากบิลด์ก่อนหน้า ***mix phx.digest.clean***
:::

### ย้ายฐานข้อมูล {#migrate-databases}
:::info
ส่วนนี้จะล้มเหลวหากคุณไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูลของคุณอย่างถูกต้อง คุณไม่ได้ระบุหรือคุณกำหนดพารามิเตอร์ผิดที่ตัวแปรแวดล้อม DATABASE_URLผู้ใช้ฐานข้อมูลต้องมีสิทธิ์การใช้งาน Superuser
:::
```bash
mix do ecto.create, ecto.migrate
```

หากคุณต้องการวางฐานข้อมูลก่อน ให้เรียกใช้
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### ติดตั้งรูปแบบการขึ้นต่อกัน npm และคอมไพล์สินทรัพย์ส่วนหน้า {#install-npm-dependencies-and-compile-frontend-assets}
คุณจำเป็นต้องเปลี่ยนไดเรกทอรีเป็นโฟลเดอร์ที่มีสินทรัพย์ส่วนหน้า

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info อดทนไว้
การคอมไพล์สินทรัพย์เหล่านี้อาจใช้เวลาสองสามนาที และจะไม่แสดงเอาต์พุตใดๆอาจดูเหมือนกระบวนการติดขัด แต่โปรดอดทนไว้เมื่อกระบวนการคอมไพล์เสร็จสิ้น ก็ควรเอาต์พุตสิ่งที่ดูเหมือนสิ่งนี้: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`
:::

### สร้างสินทรัพย์แบบคงที่ {#build-static-assets}
สำหรับขั้นตอนนี้ คุณต้องกลับไปที่รูทของโฟลเดอร์โคลน Blockscout
```bash
cd ~/blockscout
sudo mix phx.digest
```

### สร้างใบรับรองที่ลงนามเอง {#generate-self-signed-certificates}
:::info
คุณสามารถข้ามขั้นตอนนี้ หากคุณจะไม่ใช้ `https`
:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## ส่วนที่ 4 - สร้างและเรียกใช้บริการ Blockscout {#part-4-create-and-run-blockscout-service}
ในส่วนนี้ เราจำเป็นต้องตั้งค่าบริการระบบ เนื่องจากเราต้องการให้ Blockscout ทำงานในพื้นหลังและคงอยู่หลังการรีบูตระบบ

### สร้างไฟล์บริการ {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### แก้ไขไฟล์บริการ {#edit-service-file}
ใช้โปรแกรมแก้ไขข้อความ Linux ที่คุณชื่นชอบเพื่อแก้ไขไฟล์นี้และกำหนดค่าบริการ
```bash
sudo vi /etc/systemd/system/explorer.service
```
เนื้อหาของไฟล์ explorer.service ควรมีลักษณะดังนี้:
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

### เปิดใช้งานการเริ่มต้นบริการในการบูตระบบ {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### ย้ายโฟลเดอร์โคลน Blockscout ของคุณไปยังตำแหน่งทั้งระบบ {#move-your-blockscout-clone-folder-to-system-wide-location}
บริการ Blockscout ต้องมีสิทธิ์เข้าถึงโฟลเดอร์ที่คุณโคลนจากพื้นที่เก็บข้อมูล Blockscout และคอมไพล์สินทรัพย์ทั้งหมด
```bash
sudo mv ~/blockscout /usr/local
```

### สร้างไฟล์ตัวแปรแวดล้อมที่บริการ Blockscout จะใช้ {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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
ใช้ `SECRET_KEY_BASE` ที่คุณสร้างในส่วนที่ 3
:::บันทึกไฟล์และออก

### สุดท้าย เริ่มบริการ Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## ส่วนที่ 5 - ทดสอบการทำงานของอินสแตนซ์ Blockscout ของคุณ {#part-5-test-out-the-functionality-of-your-blockscout-instance}
ตอนนี้เหลือเพียงตรวจสอบว่าบริการ Blockscout ทำงานอยู่หรือไม่ตรวจสอบสถานะบริการด้วย:
```bash
sudo systemctl status explorer.service
```

การตรวจสอบเอาต์พุตบริการ:
```bash
sudo journalctl -u explorer.service -f
```

คุณสามารถตรวจสอบว่ามีพอร์ตรอรับการสื่อสารใหม่หรือไม่:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

คุณควรได้รับรายการพอร์ตรับการเชื่อมต่อและในรายการควรมีสิ่งที่ดูเหมือนสิ่งนี้:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

บริการเว็บ Blockscout เรียกใช้พอร์ตและโปรโตคอลที่กำหนดไว้ในไฟล์ envในตัวอย่างนี้ บริการเว็บจะเรียกใช้บน `4000`(http)   หากทุกอย่างเรียบร้อย คุณควรสามารถเข้าถึงเว็บพอร์ทัล Blockscout ด้วย `http://<host_ip>:4000`

## ข้อควรพิจารณา {#considerations}
เพื่อประสิทธิภาพที่ดีที่สุด ขอแนะนำให้มี `polygon-edge` ซึ่งเป็นโหนดที่ไม่ใช้โหนดตัวตรวจสอบความถูกต้องแบบเก็บถาวรเต็มรูปแบบเฉพาะงาน/ในเครื่องที่จะใช้สำหรับการสืบค้น Blockscout เท่านั้น    API `json-rpc` ของโหนดนี้ ไม่จำเป็นต้องเปิดเผยต่อสาธารณะ เนื่องจาก Blockscout เรียกใช้การสืบค้นทั้งหมดจากแบ็กเอนด์


## ความคิดสุดท้าย {#final-thoughts}
เราเพิ่งปรับใช้อินสแตนซ์ Blockscout เดียว ซึ่งทำงานได้ดี แต่สำหรับการใช้งานจริง คุณควรพิจารณาวางอินสแตนซ์นี้ไว้ด้านหลังพร็อกซีย้อนกลับ เช่น Nginxคุณยังควรคำนึงถึงความสามารถในการปรับขนาดฐานข้อมูลและอินสแตนซ์ด้วย ทั้งนี้ขึ้นอยู่กับกรณีการใช้งานของคุณ

คุณควรตรวจสอบ[เอกสาร Blockscout](https://docs.blockscout.com/) อย่างเป็นทางการให้ชัดเจน เนื่องจากมีตัวเลือกการปรับแต่งมากมาย