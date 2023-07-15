---
id: set-up-ibft-locally
title: ローカル設定
description: "ステップバイステップのローカル設定ガイドです。"
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution このガイドはテスト用の目的のみにお使いください。

下記のガイドはテストと開発の目的のためにローカルマシンにPolygon Edgeネットワークを設定する方法について説明します。

手順は実際に使用するシナリオのためにPolygon Edgeネットワークをクラウドプロバイダー：クラウド**[設定](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## 要件 {#requirements}

Polygon Edgeをインストールするには、[インストール](/docs/edge/get-started/installation)を参照してください。

## 概要 {#overview}

![ローカル設定](/img/edge/ibft-setup/local.svg)

このガイドの目標は[IBFTコンセンサスプロトコル](https://github.com/ethereum/EIPs/issues/650)で作動する`polygon-edge`ブロックチェーンネットワークを確立することです。ブロックチェーンネットワークは4ノードからなり、その4ノードはすべてバリデータノードであるため、ブロックの提案と他のプロポーザから提供されたブロックの検証の両方を行う資格があります。4ノードはすべて同じマシン上で実行されますが、これはこのガイドで、最短で完全に機能するIBFRクラスターを提供しようとしているためです。

これを行うための、4つの簡単なステップを示します：

1. データディレクトリの初期化は、4ノードにそれぞれのバリデータ鍵を生成と空のブロックチェーンデータディレクトリの初期化の両方を行います。バリデータ鍵が重要なのは、これらの鍵を使用して初期のバリデータセットでジェネシスブロックをブートストラップする必要があるためです。
2. ブードノード用に接続文字列を準備することは最初に起動したときにどのノードに接続するかについて実行するすべてのノードにとって非常に重要な情報となります。
3. `genesis.json`ファイルを生成するには入力として**ステップ1**で生成された、ジェネシスブロックにネットワークの最初のバリデータを設定するために使用するバリデータ鍵と**ステップ2**からのブートノード接続文字列の両方が必要です。
4. すべてのノードを実行することがこのガイドの最終目標であり、最後のステップになります。ノードにどのデータディレクトリを使用し、当初のネットワークステートをブートストラップする`genesis.json`をどこで見つけるかを指示します。

4つのノードはすべてローカルホストで実行されるため、設定プロセス中には各ノードのデータディレクトリがすべて同じ親ディレクトリに存在することが想定されます。

:::info バリデータの数

クラスタ内のノード数に最小値はありません。つまり、バリデータノードが1つだけのクラスタも可能です。
_シングル_のノードクラスタでは、**クラッシュ耐性**や**BFT保証**がないことに注意してください。

BFT保証を達成するために推奨される最小ノード数は4です。これは、4ノードクラスタでは1ノードの不備は許容され、残りの3ノードは正常に機能します。

:::

## ステップ1：IBFTのデータフォルダを初期化し、バリデータ鍵を生成する {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

IBFTを起動し実行するには、各ノードについてデータフォルダを1つずつ初期化する必要があります。

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

これらの各コマンドはバリデータ鍵、BLS公開鍵、[ノードID](https://docs.libp2p.io/concepts/peer-id/)をプリントします。次のステップで、最初のノードのノードIDが必要です。

### 秘密の出力 {#outputting-secrets}
必要に応じて、秘密の出力を再度取得することができます。

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## ステップ2：ブートノードのmultiaddr接続文字列を準備します {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

ノードが正常に接続を確立するには、ネットワーク上の残りすべてのノードに関する情報を得るために接続する`bootnode`サーバを知っておく必要があります。`bootnode`はしばしばp2pジャーゴンの`rendezvous`サーバとしても知られています。

`bootnode`はPolygon Edgeノードの特殊なインスタンスではありません。すべてのPolygon Edgeノードは`bootnode`として機能することができますが、しかしすべてのPolygon Edgeノードはネットワーク内のすべての残りのノードと接続するための情報を提供するために連絡される指定されたブートノードのセットを持つ必要があります。

ブートノードを指定するための接続文字列を作成するには、[multiaddr形式](https://docs.libp2p.io/concepts/addressing/)に準拠する必要があります：
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

このガイドでは、最初のノードと2番目のノードを、他のすべてのノードのブートノードとして扱います。このシナリオでは、`node 1`または`node 2`に接続するノードは、相互にコントラクトされたブートノードを介して相互に接続する方法に関する情報を取得します。

:::info ノードをスタートするには、少なくとも1つのブートノードを指定する必要があります

ネットワーク内の他のノードが相互に検出できるように、少なくとも**1つ**のブートノードが必要です。より多くのブートノードを使用することをお勧めします。これは、停止時にネットワークに復元力を提供するためです。
このガイドでは2つのノードをリストしますが、これはその場で変更できるもので、`genesis.json`ファイルの有効性には影響ありません。
:::

ローカルホスト上で実行しているため、`<ip_address>`は`127.0.0.1`であると仮定しても安全です。

`<port>`には、`10001`を使用します。これは、このポートを後で聞くために`node 1`のlibp2pサーバを設定するからです。

最後に、以前に実行したコマンド`polygon-edge secrets init --data-dir test-chain-1`コマンドの出力から取得できる`<node_id>`が必要です（これはの`node1`ための鍵とデータディレクトリを生成するために使用されました）。

アセンブリ後、ブートノードとして使用する`node 1`に対するmultiaddr接続文字列はこのように見えます（最後にある`<node_id>`だけは異なるはずです）。
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
同様に、次に示すように第2ブートノード用にmultiaddrを構築します
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info IPSの代わりのDNSホスト名

Polygon Edgeは、ノードの構成にDNSホスト名を使用することをサポートします。これは、さまざまな理由でノードのIPアドレスが変更される可能性があるため、クラウドベースの展開に非常に役立つ機能です。

DNSホスト名を使用する場合の接続文字列のmultiaddr形式は次のとおりです：
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## ステップ3：4ノードをバリデータとしてジェネシスファイルを生成する {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

このコマンドが行う内容：

* `--ibft-validators-prefix-path`はPolygon Edgeで使用できるIBFTを指定したプレフィックスフォルダパスを設定します。このディレクトリはバリデータの秘密鍵を保持する`consensus/`フォルダを収納するために使用されます。バリデータの公開鍵はジェネシスファイル（ブートストラップノードの最初のリスト）を構築するために必要です。このフラグはローカルホストにネットワークを設定する際にのみ理にかなうもので、実際のシナリオではすべてのノードのデータディレクトリが公開鍵を容易に読み取ることができる同じファイルシステムに置かれることは期待できません。
* `--bootnode`はノードが互いを見つけることを可能にするブートノードのアドレスを設定します。**ステップ2**で説明したように、`node 1`のmultiaddr文字列を使用します。

このコマンドの結果は新しいブロックチェーンのジェネシスブロックを含む`genesis.json`ファイルであり、定義済みのバリデータセットと接続を確立するために最初に連絡するノードの設定が含まれています。

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
それは、limits.confファイルで定義した値に設定されている必要があります。
:::


## ステップ4：すべてのクライアントを実行する {#step-4-run-all-the-clients}

4ノードからなるPolygon Edgeネットワーク全体を同一マシンで実行しようとしているため、ポートコンフリクトを回避するよう注意する必要があります。このため、これはノードの各サーバのリスニングポートを決定するために次の論法を使用します：

- `10000`はgRPCサーバの`node 1`向け、`20000`はGRPCサーバの`node 2`向けなど。
- `10001`はlibp2pサーバの`node 1`向け、`20001`はlibp2pサーバの`node 2`向けなど。
- `10002`はJSON-RPCサーバの`node 1`向け、`20002`はJSON-RPCサーバの`node 2`向けなど。

**第1**クライアントを実行するために（ポート`10001`に注意します。これが**ステップ2**でlibp2p multiaddrの一部としてノード1のノードIDと一緒に使用されたためです）:

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

**第2**クライアントを実行するために：

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

**第3**クライアントを実行するには：

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

**第4**クライアントを実行するために：

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

これまでに行われたことを簡単に説明します：

* クライアントデータ用のディレクトリは、**./test-chain-\***として指定されています。
* ノードごとにそれぞれポート**10000**、**20000**、**30000**、**40000**でGRPCサーバが起動されています。
* ノードごとにそれぞれポート**10001**、**20001**、**30001**、**40001**でlibp2pサーバが起動されています。
* ノードごとにそれぞれポート**10002**、**20002**、**30002**、**40002**でJSON-RPCサーバが起動されています。
* *シール*フラグは起動されているノードがブロックシーリングに参加するつもりであることを意味します。
* *チェーン*フラグはチェーン設定に使用するジェネシスファイルを指定します。

ジェネシスファイルの構造は[CLIコマンド](/docs/edge/get-started/cli-commands)セクションでカバーされています。

以前のコマンドを実行した後、ブロックのシール、ノード不備からの回復が可能な、4ノードのPolygon Edgeネットワークを設定しました。

:::info 設定ファイルを使用してクライアントを起動します

すべての設定パラメータをCLI引数として指定する代わりに、次のコマンドを実行することで設定ファイルを使用してクライアントを起動することもできます：

````bash
polygon-edge server --config <config_file_path>
````
例：

````bash
polygon-edge server --config ./test/config-node1.json
````
現在、設定ファイルをサポートしており、設定ファイルを`json`ベースに`yaml`しています。サンプル設定ファイルは**[こちら](/docs/edge/configuration/sample-config)**でご覧いただけます。

:::

:::info ノンバリデータノードを実行するステップ

ノンバリデータは常にバリデータノードから受信した最新のブロックを同期します。次のコマンドを実行すると、ノンバリデータノードをスタートできます。

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
たとえば、次のコマンドを実行して、**第5**ノンバリデータクライアントを追加できます：

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info 価格制限を指定します

Polygon Edgeノードは、着信トランザクションに対して設定された**価格制限**で開始できます。

価格制限の単位は`wei`です。

価格制限の設定は、現在のノードで処理されたトランザクションは設定された価格制限**よりも高い**ガス価格を必要とすることを意味し、そうでなければブロックに含まれることはありません。

ノードの大半が一定の価格制限を尊重することで、ネットワーク内のトランザクションは一定の価格しきい値を下回ることはできないというルールを強制します。

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



## ステップ5: Polygon Edgeネットワークとのやり取り {#step-5-interact-with-the-polygon-edge-network}

少なくとも1つの実行クライアントを設定したので、上記で前払いしたアカウントを使用し4ノードのいずれかにJSON-RPC URLを指定することで、先に進み、ブロックチェーンとやり取りできるようになります。
- ノード1：`http://localhost:10002`
- ノード2：`http://localhost:20002`
- ノード3：`http://localhost:30002`
- ノード4：`http://localhost:40002`

このガイドに従って新しく構築されたクラスタにオペレータコマンドを発行します：[オペレータ情報をクエリする方法](/docs/edge/working-with-node/query-operator-info)（構築したクラスタのGRPCポートはノードごとにそれぞれが`10000`/`20000`/`30000`/`40000`となっています）
