---
id: setup
title: 設定
description: ChainBridgeの設定方法
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## コントラクトのデプロイメント {#contracts-deployment}

このセクションでは、Polygon PoSとPolygon Edgeチェーンに`cb-sol-cli`で必要なコントラクトをデプロイします。

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

まず、Polygon PoSチェーンに`cb-sol-cli deploy`コマンドでコントラクトをデプロイします。`--all`フラグによりコマンドがブリッジ、ERC20ハンドラー、ERC721ハンドラー、ジェネリックハンドラー、ERC20、ERC721コントラクトを含むすべてのコントラクトをデプロイします。さらに、これはデフォルトのリレイヤーアカウントアドレスとそのしきい値を設定します

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


チェーンIDとJSON-RPC URLについて[ここ](/docs/edge/additional-features/chainbridge/definitions)で学びましょう

:::caution

`cb-sol-cli`のデフォルトのガス価格は`20000000`（`0.02 Gwei`）です。トランザクションの適切なガス価格を設定するには、`--gasPrice`引数を使用して値を設定してください。

```bash
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1 \
  # Set gas price to 5 Gwei
  --gasPrice 5000000000
```

:::

:::caution

ブリッジコントラクトのデプロイには約0x3f97b8（4167608）ガスかかります。生成しているブロックがコントラクト作成トランザクションを含むために十分なブロックガス制限を持つことを確認してください。Polygon Edgeのブロックガス制限の変更について詳細を学ぶには、
[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)を参照してください。

:::

いったんコントラクトがデプロイされると、次の結果が得られます：

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC721Handler contract deployed
✓ GenericHandler contract deployed
✓ ERC20 contract deployed
WARNING: Multiple definitions for safeTransferFrom
✓ ERC721 contract deployed

================================================================
Url:        https://rpc-mumbai.matic.today
Deployer:   <ADMIN_ACCOUNT_ADDRESS>
Gas Limit:   8000000
Gas Price:   20000000
Deploy Cost: 0.00029065308

Options
=======
Chain Id:    <CHAIN_ID>
Threshold:   <RELAYER_THRESHOLD>
Relayers:    <RELAYER_ACCOUNT_ADDRESS>
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             <BRIDGE_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20 Handler:      <ERC20_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Generic Handler:    <GENERIC_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20:              <ERC20_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721:             <ERC721_CONTRACT_ADDRESS>
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

これでコントラクトをPolygon Edgeチェーンにデプロイすることができます。

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

デプロイされたスマートコントラクトアドレスを持つターミナル出力を保存しましょう、次のステップで必要になります。

## リレイヤー設定 {#relayer-setup}

このセクションでは、2つのチェーン間のデータ交換のためにリレイヤーをスタートします。

まず、ChainBridgeレポジトリをクローン、ビルドする必要があります。

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

次に、`config.json`を作成して、チェーンごとにJSON-RPC URL、リレイヤーアドレス、コントラクトアドレスを設定する必要があります。

```json
{
  "chains": [
    {
      "name": "mumbai",
      "type": "ethereum",
      "id": "99",
      "endpoint": "https://rpc-mumbai.matic.today",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    },
    {
      "name": "polygon-edge",
      "type": "ethereum",
      "id": "100",
      "endpoint": "http://localhost:10002",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    }
  ]
}
```

リレイヤーをスタートするには、リレイヤーアカウントアドレスに対応する秘密鍵をインポートする必要があります。秘密鍵をインポートする際にパスワードを入力する必要があります。インポートが成功すると、鍵は`keys/<ADDRESS>.key`の下に保存されます。

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

その後、リレイヤーをスタートすることができます。最初に鍵を保存するために選択したのと同じパスワードを入力する必要があります。

```bash
# Start relayer
$ chainbridge --config config.json --latest

INFO[11-19|07:15:19] Starting ChainBridge...
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:25] Connecting to ethereum chain...          chain=mumbai url=<JSON_RPC_URL>
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:31] Connecting to ethereum chain...          chain=polygon-edge url=<JSON_RPC_URL>
```

リレイヤーはいったん開始されると各チェーン上の新しいブロックの監視をスタートします。
