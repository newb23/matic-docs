---
id: use-case-erc20-bridge
title: ユースケース - ERC20ブリッジ
description: ERC20コントラクトブリッジの例
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

このセクションでは実用的なユースケース用のERC20ブリッジの設定フローを提供することを目的としています。

このガイドでは、Mumbai Polygon PoSテストネットとPolygon Edgeローカルチェーンを使用します。Mumbai用にJSON-RPCエンドポイントがあり、ローカル環境にPolygon Edgeを設定していることを確認してください。詳細は[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)または[クラウド設定](/docs/edge/get-started/set-up-ibft-on-the-cloud)を参照してください。

## シナリオ {#scenario}

このシナリオは、通常のケースにおいてユーザーにプライベートチェーン（Polygon Edge）内での低コストの転送を可能にするためにすでにパブリックチェーン（Polygon PoS）にデプロイされたERC20トークン用のブリッジを設定するものです。こうした場合、トークンの総供給はパブリックチェーンで定義されており、パブリックチェーンからプライベートチェーンに転送されたトークンの額だけがプライベートチェーンに存在する必要があります。そのため、パブリックチェーンのロック／リリースモードとプライベートチェーンのバーン／ミントモードを使用する必要があります。

パブリックチェーンからプライベートチェーンにトークンを送信する時、トークンはパブリックチェーンのERC20ハンドラーコントラクトにロックされ、同じ額のトークンがプライベートチェーンにミントされます。一方、プライベートチェーンからパブリックチェーンに転送する場合、プライベートチェーンのトークンがバーンされ、パブリックチェーンのERC20ハンドラーコントラクトから同じ額のトークンがリリースされます。

## コントラクト {#contracts}

ChainBridgeが開発したコントラクトではなく簡単なERC20コントラクトで説明します。バーン／ミントモードでは、ERC20コントラクトは次のようなERC20のメソッドに加え、`mint`および`burnFrom`メソッドを持っている必要があります：

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SampleToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    function mint(address recipient, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        _mint(recipient, amount);
    }

    function burnFrom(address owner, uint256 amount)
        external
        onlyRole(BURNER_ROLE)
    {
        _burn(owner, amount);
    }
}
```

すべてのコードとスクリプトはGithubレポジトリ[Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)にあります。

## ステップ1：ブリッジおよびERC20ハンドラーコントラクトをデプロイする {#step1-deploy-bridge-and-erc20-handler-contracts}

まず、両方のチェーンで`cb-sol-cli`を使用してブリッジとERC20ハンドラーコントラクトをデプロイします。

```bash
# Deploy Bridge and ERC20 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC20 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

ブリッジとERC20ハンドラーコントラクトアドレスは次のようになります：

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

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
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              Not Deployed
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

## ステップ2：ERC20コントラクトをデプロイする {#step2-deploy-your-erc20-contract}

ERC20コントラクトをデプロイします。この例ではハードハットプロジェクト[Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)で説明します。

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

`.env`ファイルを作成し、次の値を設定してください。

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

次に、両方のチェーンにERC20コントラクトをデプロイします。

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

デプロイに成功すると、次のようなコントラクトアドレスが得られます：

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## ステップ3：ブリッジにリソースIDを登録する {#step3-register-resource-id-in-bridge}

クロスチェーン環境でリソースを関連付けるリソースIDを登録します。両方のチェーンに同じリソースIDを設定する必要があります。

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## ステップ4：EdgeのERC20ブリッジでミント／バーンモードを設定する {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

ブリッジはPolygon Edgeでバーン／ミントモードとして動作することを予定しています。バーン／ミントモードは`cb-sol-cli`を使用して設定します。

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

そしてERC20ハンドラーコントラクトにミンターとバーナーの役割を付与する必要があります。

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## ステップ5：トークンをミントする {#step5-mint-token}

Mumbaiチェーンに新しいERC20トークンをミントします。

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

トランザクションが成功した後、アカウントはミントされたトークンを持つようになります。

## ステップ6：ERC20転送のスタート {#step6-start-erc20-transfer}

このステップを始める前に、リレイヤーを起動したことを確認してください。詳細については[設定](/docs/edge/additional-features/chainbridge/setup)を確認してください。

MumbaiからEdgeへとトークンを転送する際に、MumbaiのERC20ハンドラーコントラクトはアカウントからトークンを引き出します。転送する前に承認を呼び出します。

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

最後に、MumbaiからEdgeへのトークン転送を`cb-sol-cli`を使用して開始します。

```bash
# Start transfer from Mumbai to Polygon Edge chain
$ cb-sol-cli erc20 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --amount 10 \
  # ChainID of Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
```

デポジットトランザクションが成功した後、リレイヤーはイベントを取得し、提案に投票します。必要な票数が送信された後、Polygon Edgeチェーン内の受信者アカウントにトークンを送信するトランザクションを実行します。

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

実行トランザクションが成功すると、Polygon Edgeチェーンでトークンが取得されます。
