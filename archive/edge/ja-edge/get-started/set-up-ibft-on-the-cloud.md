---
id: set-up-ibft-on-the-cloud
title: クラウド設定
description: "ステップバイステップのクラウド設定ガイド。"
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info このガイドは、メインネットまたはテストネットの設定を対象としています

次のガイドでは、テストネットまたはメインネットのプロダクション設定のために、クラウドプロバイダにPolygon Edgeネットワークを設定する方法を説明します。

実稼働環境のようなセットアップを行う前に、`polygon-edge`を迅速にテストするためにPolygonEdgeネットワークをローカルでセットアップする場合は、**[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)**
:::

## 要件 {#requirements}

Polygon Edgeをインストールするには、[インストール方法](/docs/edge/get-started/installation)を参照してください。

### VM接続の設定 {#setting-up-the-vm-connectivity}

選択したクラウドプロバイダに応じて、ファイアウォール、セキュリティグループ、またはアクセス制御リストを使用してVM間の接続とルールを設定することができます。

他のVMに公開する必要がある`polygon-edge`の唯一の部分はlibp2pサーバであるため、デフォルトのlibp2pポート`1478`上でVM間の通信をすべて許可するだけで十分です。

## 概要 {#overview}

![クラウド設定](/img/edge/ibft-setup/cloud.svg)

このガイドでは[IBFTコンセンサスプロトコル](https://github.com/ethereum/EIPs/issues/650)で作動する`polygon-edge`ブロックチェーンネットワークを確立することを目的にしています。ブロックチェーンネットワークは4つのノードで構成され、その4つはすべてバリデータノードであり、したがってブロックの提案と他の提案者から来たブロックの検証の両方が可能です。
このガイドの目的は、バリデータ鍵をプライベートにしてトラストレスネットワークの設定を確実にすると同時に、完全に機能するPolygon Edgeネットワークを提供することですので、4つのノードはそれぞれ独自のVMで実行されます。

これを実現するために、次の4つの簡単な手順を案内します：

0. 上記の**要件**のリストを参照してください。
1. 各バリデータの秘密鍵を生成し、データディレクトリを初期化します
2. 共有`genesis.json`に配置するブートノードの接続文字列を準備します
3. ローカルマシンに`genesis.json`を作成し、各ノードに送信／転送します
4. すべてのノードをスタートします

:::info バリデータの数

クラスタ内のノード数に最小値はありません。つまり、バリデータノードが1つだけのクラスタも可能です。
_シングル_のノードクラスタでは、**クラッシュ耐性**や**BFT保証**がないことに注意してください。

BFT保証を達成するために推奨される最小ノード数は4です。これは、4ノードクラスタでは1ノードの障害が許容され、残りの3ノードは正常に機能するためです。

:::

## ステップ1：データフォルダの初期化とバリデータ鍵の生成 {#step-1-initialize-data-folders-and-generate-validator-keys}

Polygon Edgeを起動して実行するには、各ノードでデータフォルダを初期化する必要があります。：


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

これらの各コマンドは、バリデータ鍵、bls公開鍵、および[ノードID](https://docs.libp2p.io/concepts/peer-id/)を出力します。次のステップで、最初のノードのノードIDが必要です。

### 秘密の出力 {#outputting-secrets}
必要に応じて、秘密の出力を再度取得することができます。

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning データディレクトリを自分自身で保管してください！

上記で生成されたデータディレクトリは、ブロックチェーン状態を保持するディレクトリを初期化するだけでなく、バリデータの秘密鍵も生成します。**この鍵は秘密にしておく必要があります。この鍵が盗まれると、誰かがネットワーク内であなたになりすまし、バリデータになることができるからです！**

:::

## ステップ2：ブートノードのmultiaddr接続文字列を準備します {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

ノードが正常に接続を確立するには、ネットワーク上の残りすべてのノードに関する情報を取得するために接続する`bootnode`サーバを認識している必要があります。`bootnode`は、p2p用語では`rendezvous`サーバとも呼ばれます。

`bootnode`は、Polygon Edgeノードの特殊なインスタンスではありません。すべてのPolygon Edgeノードは`bootnode`として機能することができ、すべてのPolygon Edgeノードには、ネットワーク内の残りすべてのノードとの接続方法に関する情報を提供するためにコントラクトされるブートノードのセットが指定されている必要があります。

ブートノードを指定するための接続文字列を作成するには、[multiaddr形式](https://docs.libp2p.io/concepts/addressing/)に準拠する必要があります：
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

このガイドでは、最初のノードと2番目のノードを、他のすべてのノードのブートノードとして扱います。このシナリオでは、`node 1`または`node 2`に接続するノードは、相互にコントラクトされたブートノードを介して相互に接続する方法に関する情報を取得します。

:::info ノードをスタートするには、少なくとも1つのブートノードを指定する必要があります

ネットワーク内の他のノードが相互に検出できるように、少なくとも**1つ**のブートノードが必要です。より多くのブートノードを使用することをお勧めします。これは、停止時にネットワークに復元力を提供するためです。
このガイドでは、2つのノードを示しますが、`genesis.json`ファイルの有効性に影響を与えることなく、すぐに変更できます。
:::

multiaddr接続文字列の最初の部分は`<ip_address>`であるため、ここでは他のノードから到達可能なIPアドレスを入力する必要があります。これは、設定によっては`127.0.0.1`ではなくプライベートIPアドレスまたはパブリックIPアドレスである可能性があります。

`<port>`にはデフォルトのlibp2pポートであるため、`1478`を使用します。

最後に、以前に実行したコマンド`polygon-edge secrets init --data-dir data-dir`（`node 1`用の鍵とデータディレクトリの生成に使用されたコマンド）の出力から取得できるが`<node_id>`必要です

アセンブリ後、ブートノードとして使用する`node 1`へのmultiaddr接続文字列は次のようになります（末尾にある`<node_id>`だけが異なるはずです）：
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
同様に、次に示すように、2番目のブートノード用にmultiaddrを構築します
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info IPSではなくDNSホスト名

Polygon Edgeは、ノードの構成にDNSホスト名を使用することをサポートします。これは、さまざまな理由でノードのIPアドレスが変更される可能性があるため、クラウドベースの展開に非常に役立つ機能です。

DNSホスト名を使用する場合の接続文字列のmultiaddr形式は次のとおりです：
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## ステップ3：4つのノードをバリデータとして使用してジェネシスファイルを生成します {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

このステップはローカルマシン上で実行できますが、4つのバリデータそれぞれに対してバリデータ公開鍵が必要になります。

バリデータは、`secrets init`コマンドの出力に次に示すように`Public key (address)`を安全に共有できるため、公開鍵で識別される初期バリデータセット内のこれらのバリデータでgenesis.jsonを安全に生成できます：

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

4つのバリデータの公開鍵をすべて受信した場合は、次のコマンドを実行して`genesis.json`を生成できます

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

このコマンドが行うこと：

* `--ibft-validator`は、ジェネシスブロックに設定された初期バリデータセットに含まれる必要があるバリデータの公開鍵を設定します。多くの初期バリデータが存在する場合があります。
* `--bootnode`は、ノードが相互に検索できるようにするブートノードのアドレスを設定します。
**ステップ2**で説明したように、`node 1`のmultiaddr文字列を使用しますが、上記のようにブートノードを必要なだけ追加できます。

:::info ECDSAに切り替える

BLSはブロックヘッダーのデフォルトのバリデーションモードです。ECDSAモードでチェーンを実行したい場合は、引数を指定して`—ibft-validator-type`フラグを使用することができます`ecdsa`：

```
genesis --ibft-validator-type ecdsa
```
:::

:::info アカウント残高の前払い

おそらく、いくつかのアドレスが「前払い」残高を持つブロックチェーンネットワークを設定したいと思われるでしょう。

これを実現するには、ブロックチェーン上の特定の残高で初期化する`--premine`フラグを、アドレスごとに必要な数だけ渡します。

たとえば、ジェネシスブロックで`0x3956E90e632AEbBF34DEB49b71c28A83Bc029862`アドレスに1000ETHを前払いする場合は、次の引数を提供する必要があります：

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**前払い額はETHではなくWEIであることに注意してください。**

:::

:::info ブロックのガス制限を設定します

各ブロックのデフォルトのガス制限は`5242880`です。この値はジェネシスファイルに書き込まれますが、増減が必要になる場合があります。

これを行うには、次に示すように、フラグ`--block-gas-limit`の後に目的の値を入力します：

```shell
--block-gas-limit 1000000000
```

:::

:::info システムファイル記述子の制限を設定します

一部のオペレーティングシステムでは、デフォルトのファイル記述子の制限（開くファイルの最大数）が非常に小さくなっています。
ノードのスループットを高くしたい場合は、OSレベルでこの制限を増やすことを検討することもあるでしょう。

Ubuntu distroの手順は次のとおりです(Ubuntu/Debian distroを使用していない場合は、お使いのOSの公式ドキュメントをチェックしてください)：
- 現在のOS制限（開くファイル）をチェックします
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

- 開いているファイルの制限を増やします
	- ローカルで - 現在のセッションだけに影響します：
	```shell
	ulimit -u 65535
	```
	- グローバルでまたはユーザ単位（/etc/security/limits.confファイルの末尾に制限を追加）:
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
任意で、追加パラメータを変更し、ファイルを保存してシステムを再起動します。
再起動後、ファイル記述子の制限を再度チェックします。
この値は、limits.confファイルで定義した値に設定する必要があります。

:::

以下を指定した後：
1. バリデータセットとしてジェネシスブロックに含まれるバリデータの公開鍵
2. ブートノードmultiaddr接続文字列
3. ジェネシスブロックに含めるように前払されたアカウントと残高

`genesis.json`を生成するには、ネットワーク内のすべてのVMにコピーする必要があります。設定によっては、コピー／ペーストするか、ノードオペレータに送信するか、単にSCP/FTPで上書きします。

ジェネシスファイルの構造については、[CLIコマンド](/docs/edge/get-started/cli-commands)セクションを参照してください。

## ステップ4：すべてのクライアントを実行します {#step-4-run-all-the-clients}

:::note クラウドプロバイダ上のネットワーキング

ほとんどのクラウドプロバイダは、IPアドレス（特にパブリックアドレス）をVMのダイレクトネットワークインターフェースとして公開せず、見えないNATプロキシを設定します。


この場合、ノードが相互に接続できるようにするには、`0.0.0.0`IPアドレスをリッスンしてすべてのインターフェイスでバインドする必要がありますが、他のノードがインスタンスへの接続に使用できるIPアドレスまたはDNSアドレスを指定する必要があります。これは、外部IPアドレスまたはDNSアドレスをそれぞれ指定できる`--nat`または`--dns`引数を使用することによって実現されます。

#### 例 {#example}

リッスンする関連IPアドレスは`192.0.2.1`ですが、どのネットワークインターフェイスにも直接バインドされません。

ノードの接続を許可するには、次のパラメータを渡します：

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

または、DNSアドレス`dns/example.io`を指定する場合は、次のパラメータを渡します：

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

これにより、ノードはすべてのインターフェイスでリッスンしますが、クライアントが指定された`--nat`または`--dns`アドレスを使用してそのノードに接続していることも認識します。

:::

**第1**クライアントを実行するには：


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**第2**クライアントを実行するには：

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**第3**クライアントを実行するには：

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**第4**クライアントを実行するには：

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

前のコマンドを実行した後、ブロックをシールしてノード障害から回復することができる4ノードのPolygon Edgeネットワークを設定しました。

:::info 設定ファイルを使用してクライアントを起動します

すべての設定パラメータをCLI引数として指定する代わりに、次のコマンドを実行して、設定ファイルを使用してクライアントを起動することもできます：

````bash
polygon-edge server --config <config_file_path>
````
例：

````bash
polygon-edge server --config ./test/config-node1.json
````
現在、`json`ベースの設定ファイルのみをサポートしています。サンプル設定ファイルは**[こちらを](/docs/edge/configuration/sample-config)**ご覧ください。

:::

:::info ノンバリデータノードを実行するステップ

ノンバリデータは常にバリデータノードから受信した最新のブロックを同期します。次のコマンドを実行すると、ノンバリデータノードをスタートできます。

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
たとえば、次のコマンドを実行して、**第5**ノンバリデータクライアントを追加できます：

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info 価格制限を指定します

Polygon Edgeノードは、着信トランザクションに対して設定された**価格制限**で開始できます。

価格制限の単位は`wei`です。

価格制限を設定するということは、現在のノードによって処理されるすべてのトランザクションが、設定された価格制限**よりも高い**ガス価格を持つ必要があることを意味します。そうでない場合、それはブロックに含まれません。

大多数のノードが特定の価格制限を尊重すると、ネットワーク内のトランザクションは特定の一定の価格しきい値を下回ることはできないというルールを強制します。

価格制限のデフォルト値は`0`です。つまり、デフォルトではまったく適用されません。

`--price-limit`フラグを使用する例：
````bash
polygon-edge server --price-limit 100000 ...
````

価格制限は**非ローカルトランザクションにのみ適用される**ことに注意する必要があります。つまり、ノードにローカルで追加されるトランザクションには、価格制限が適用されません。

:::

:::info WebSocket URL

デフォルトでは、Polygon Edgeを実行すると、チェーンの場所に基づいてWebSocket URLが生成されます。
URLスキーム`wss://`はHTTPSリンクに、そして`ws://`はHTTPに使用されます。

ローカルホストWebSocketのURL：
````bash
ws://localhost:10002/ws
````
ポート番号は、ノードに選択されたJSON-RPCポートによって異なることに注意してください。

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::
