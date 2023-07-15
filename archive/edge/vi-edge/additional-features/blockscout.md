---
id: blockscout
title: Blockscout
description: Cách thiết lập một phiên bản Blockscout để hoạt động với Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Tổng quan {#overview}
Hướng dẫn này đi vào chi tiết về cách biên soạn và triển khai thực thể Blockscout để hoạt động với Polygon-Edge. Blockscout có [tài liệu](https://docs.blockscout.com/for-developers/manual-deployment) riêng, nhưng tài liệu này tập trung vào hướng dẫn từng bước đơn giản những chi tiết về cách thiết lập phiên bản Blockscout.

## Môi trường {#environment}
* Hệ điều hành: [Liên kết tải xuống](https://releases.ubuntu.com/20.04/) Ubuntu Server 20.04 LTS với các quyền sudo
* Phần cứng máy chủ: 8CPU / 16GB RAM / 50GB HDD (LVM)
* Máy chủ cơ sở dữ liệu: Máy chủ chuyên dụng với 2 CPU / 4GB RAM / 100GB SSD / PostgreSQL 13.4

### Máy chủ DB {#db-server}
Yêu cầu để làm theo hướng dẫn này là phải có sẵn một máy chủ cơ sở dữ liệu, cơ sở dữ liệu và người dùng db được định cấu hình. Hướng dẫn này sẽ không đi vào chi tiết về cách triển khai và cấu hình máy chủ PostgreSQL. Hiện giờ có rất nhiều hướng dẫn để thực hiện việc này, ví dụ như [Hướng dẫn DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info TUYÊN BỐ MIỄN TRỪ

Hướng dẫn này chỉ nhằm giúp bạn thiết lập và chạy Blockscout trên một phiên bản duy nhất không phải là thiết lập sản xuất lý tưởng.    Đối với sản xuất, có thể bạn sẽ muốn đưa proxy ngược, bộ cân bằng tải, các tùy chọn khả năng mở rộng, v.v. vào kiến trúc.

:::

# Quy trình triển khai Blockscout {#blockscout-deployment-procedure}

## Phần 1 - cài đặt các phụ thuộc {#part-1-install-dependencies}
Trước khi bắt đầu, chúng ta cần đảm bảo rằng chúng ta đã cài đặt tất cả các tệp nhị phân mà Blockcout phụ thuộc vào.

### Cập nhật & nâng cấp hệ thống {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Thêm kho lưu trữ Erlang {#add-erlang-repos}
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

### Thêm kho lưu trữ NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Cài đặt Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Cài đặt phiên bản ErLang cần thiết {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Cài đặt phiên bản Elixir cần thiết {#install-required-version-of-elixir}
Phải là phiên bản Elixir `1.13`. Nếu cố cài đặt phiên bản này từ kho lưu trữ chính thức, phiên bản `erlang` sẽ cập nhật thành `Erlang/OTP 25` và chúng ta không muốn thế.      Do đó, chúng ta cần cài đặt phiên bản `elixir` cụ thể được biên dịch trước từ trang phát hành GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Bây giờ chúng ta cần thiết lập mã nhị phân `exlixir`hệ thống đúng cách.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Kiểm tra xem `elixir` và `erlang` có được cài đặt đúng cách hay không bằng cách chạy `elixir -v`. Đây sẽ là kết quả:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

`Erlang/OTP` phải là phiên bản `24` và `Elixir` phải là phiên bản `1.13.*`.    
Nếu không đúng như vậy, bạn sẽ gặp phải sự cố khi biên dịch Blockscout và/hoặc chạy nó.

:::   
:::info

Xem ***[trang yêu cầu Blockscout chính thức](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***

:::

### Cài đặt NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Cài đặt Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### Cài đặt các mục phụ thuộc khác {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Tùy chọn cài đặt ứng dụng khách postgresql để kiểm tra kết nối db của bạn {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Phần 2 - thiết lập biến môi trường {#part-2-set-environment-variables}
Chúng ta cần thiết lập các biến môi trường, trước khi bắt đầu biên dịch Blockscout. Trong hướng dẫn này, chúng tôi sẽ chỉ đặt mức tối thiểu cơ bản để nó hoạt động.
Bạn có thể tìm thấy [tại đây](https://docs.blockscout.com/for-developers/information-and-settings/env-variables) danh sách đầy đủ của các biến có thể thiết lập

### Đặt kết nối cơ sở dữ liệu làm biến môi trường {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Bây giờ hãy kiểm tra kết nối DB của bạn với các tham số được cung cấp. Vì bạn đã cung cấp PG env vars, bạn chỉ có thể kết nối với cơ sở dữ liệu bằng cách chạy:
```bash
psql
```

Nếu cơ sở dữ liệu được định cấu hình chính xác, bạn sẽ thấy lời nhắc psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Nếu không, bạn có thể thấy lỗi như thế này:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Nếu vậy, [những tài liệu](https://ubuntu.com/server/docs/databases-postgresql) này có thể giúp bạn.

:::info Kết nối DB

Đảm bảo rằng bạn đã sắp xếp tất cả các vấn đề kết nối db trước khi chuyển sang phần tiếp theo. Bạn sẽ cần cung cấp các đặc quyền siêu người dùng cho người dùng Blockscout.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Phần 3 - nhân bản và biên dịch Blockscout {#part-3-clone-and-compile-blockscout}
Bây giờ cuối cùng chúng ta cũng bắt đầu cài đặt Blockscout.

### Nhân bản kho lưu trữ Blockscout {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Tạo cơ sở khóa bí mật để bảo vệ quá trình sản xuất {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
Ở dòng cuối cùng, bạn sẽ thấy một chuỗi dài các ký tự ngẫu nhiên.      Mục này nên được đặt làm biến môi trường `SECRET_KEY_BASE`của bạn, trước bước tiếp theo.      Ví dụ:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Thiết lập chế độ sản xuất {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Biên dịch {#compile}
Cd vào thư mục nhân bản và bắt đầu biên dịch

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Nếu bạn đã triển khai trước đó, hãy xóa nội dung tĩnh khỏi bản dựng ***mix phx.digest.clean trước đó.***.
:::

### Di chuyển cơ sở dữ liệu {#migrate-databases}
:::info

Phần này sẽ không thành công nếu bạn không thiết lập kết nối DB đúng cách, bạn không cung cấp, hoặc bạn đã xác định sai tham số tại biến môi trường DATABASE_URL. Người dùng cơ sở dữ liệu cần có các đặc quyền của người dùng siêu cấp.
:::
```bash
mix do ecto.create, ecto.migrate
```

Nếu bạn cần thả cơ sở dữ liệu trước, hãy chạy
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Cài đặt phần phụ thuộc npm và biên dịch nội dung giao diện người dùng {#install-npm-dependencies-and-compile-frontend-assets}
Bạn cần thay đổi thư mục thành thư mục chứa nội dung giao diện người dùng.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Hãy kiên nhẫn

Quá trình tổng hợp các nội dung này có thể mất vài phút và có thể sẽ không hiển thị kết quả. Có thể có vẻ như quá trình này đang bị kẹt, nhưng chỉ cần kiên nhẫn. Khi quá trình biên dịch kết thúc, một kết quả sẽ xuất ra như: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`
:::

### Xây dựng tài nguyên tĩnh {#build-static-assets}
Đối với bước này, bạn cần quay lại thư mục gốc của thư mục bản sao Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Khởi tạo chứng chỉ tự ký {#generate-self-signed-certificates}
:::info

Bạn có thể bỏ qua bước này nếu không sử dụng `https`.

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Phần 4 - tạo và chạy dịch vụ Blockscout {#part-4-create-and-run-blockscout-service}
Trong phần này, chúng ta cần thiết lập một dịch vụ hệ thống vì chúng ta muốn Blockscout chạy ở chế độ nền và tồn tại sau khi khởi động lại hệ thống.

### Tạo tệp tin dịch vụ {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Chỉnh tệp tin dịch vụ {#edit-service-file}
Sử dụng trình biên soạn linux yêu thích của bạn để chỉnh sửa tệp tin này và cấu hình dịch vụ.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Nội dung của tệp tin explorer.service sẽ giống như sau:
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

### Bật dịch vụ khởi động khi khởi động hệ thống {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Di chuyển thư mục nhân bản Blockscout của bạn đến vị trí trên toàn hệ thống {#move-your-blockscout-clone-folder-to-system-wide-location}
Dịch vụ Blockscout cần có quyền truy cập vào thư mục bạn đã nhân bản từ kho Blockscout và biên dịch tất cả các nội dung.
```bash
sudo mv ~/blockscout /usr/local
```

### Tạo tệp env vars sẽ được sử dụng bởi dịch vụ Blockscout {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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

Sử dụng `SECRET_KEY_BASE` bạn đã tạo trong Phần 3.

:::
Lưu tập tin và thoát.

### Cuối cùng, khởi động dịch vụ Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Phần 5 - kiểm tra chức năng của phiên bản Blockscout của bạn {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Bây giờ tất cả những gì còn lại cần làm là kiểm tra xem dịch vụ Blockscout có đang chạy hay không. Kiểm tra trạng thái dịch vụ với:
```bash
sudo systemctl status explorer.service
```

Kiểm tra kết quả dịch vụ:
```bash
sudo journalctl -u explorer.service -f
```

Bạn có thể kiểm tra xem có một số cổng nghe mới không:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Bạn sẽ nhận được một danh sách các cổng nghe và trong danh sách phải có một cái gì đó như sau:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Dịch vụ web Blockscout chạy cổng và giao thức được xác định trong tệp env. Trong ví dụ này, nó chạy trên `4000`(http)   .
Nếu mọi thứ đều ổn, bạn sẽ có thể truy cập vào cổng web Blockscout với `http://<host_ip>:4000`.

## Xem xét {#considerations}
Để có hiệu suất tốt nhất, bạn nên có một nút không xác thực toàn bộ kho lưu trữ cục bộ / chuyên dụng`polygon-edge`
sẽ được sử dụng riêng cho các truy vấn ·Blockscout.    
`json-rpc`API của nút này, không cần phải được hiển thị công khai, vì Blockscout chạy tất cả các truy vấn từ phần sau (backend).


## Suy nghĩ cuối cùng {#final-thoughts}
Chúng tôi vừa triển khai một phiên bản Blockscout duy nhất, hoạt động tốt, nhưng để sản xuất, bạn nên cân nhắc đặt phiên bản này sau proxy ngược như Nginx. Bạn cũng nên nghĩ về khả năng mở rộng cơ sở dữ liệu và thực thể, tùy thuộc vào trường hợp sử dụng của bạn.

Bạn chắc chắn nên xem [tài liệu Blockscout](https://docs.blockscout.com/) chính thức vì có rất nhiều tùy chọn tùy chỉnh.