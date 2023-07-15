---
id: use-case-erc721-bridge
title: ユースケース - ERC721ブリッジ
description: ERC721コントラクトブリッジの例
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

このセクションでは実用的なユースケース用のERC721ブリッジの設定フローを提供することを目的としています。

このガイドでは、Mumbai Polygon PoSテストネットとPolygon Edgeローカルチェーンを使用します。Mumbai用にJSON-RPCエンドポイントがあり、ローカル環境にPolygon Edgeを設定していることを確認してください。詳細は[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)または[クラウド設定](/docs/edge/get-started/set-up-ibft-on-the-cloud)を参照してください。

## シナリオ {#scenario}

このシナリオでは、通常のケースでユーザに対してプライベートチェーン（Polygon Edge）での低コスト転送を可能にするために、パブリックチェーン（Polygon PoS）にすでにデプロイされているERC721NFT用のブリッジを設定します。このような場合、元のメタデータはパブリックチェーンに定義され、パブリックチェーンから転送されたNFTだけがプライベートチェーンに存在することができます。そのため、パブリックチェーンではロック／リリースモード、プライベートチェーンではバーン／ミントモードを使用する必要があります。

パブリックチェーンからプライベートチェーンにNFTを送信する場合、NFTはパブリックチェーンのERC721ハンドラーコントラクトにロックされ、同じNFTがプライベートチェーンにミントされます。一方、プライベートチェーンからパブリックチェーンに転送する場合、プライベートチェーンのNFTがバーンされ、パブリックチェーンのERC721ハンドラーコントラクトから同じNFTがリリースされます。

## コントラクト {#contracts}

ChainBridgeが開発したコントラクトではなく、簡単なERC721コントラクトで説明します。バーン／ミントモードの場合、ERC721コントラクトには、次のようにERC721に定義されている方法に加えて、`mint`と`burn`メソッドが必要です：

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SampleNFT is ERC721, ERC721Burnable, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        _setBaseURI(baseURI);
    }

    function mint(
        address recipient,
        uint256 tokenID,
        string memory data
    ) public onlyRole(MINTER_ROLE) {
        _mint(recipient, tokenID);
        _setTokenURI(tokenID, data);
    }

    function burn(uint256 tokenID)
        public
        override(ERC721Burnable)
        onlyRole(BURNER_ROLE)
    {
        _burn(tokenID);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function _setBaseURI(string memory baseURI_) internal {
        baseURI = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
```

すべてのコードとスクリプトはGithubレポジトリ[Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)にあります。

## ステップ1：ブリッジおよびERC721ハンドラーコントラクトをデプロイする {#step1-deploy-bridge-and-erc721-handler-contracts}

最初に、両方のチェーンで`cb-sol-cli`を使用して、ブリッジとERC721ハンドラーコントラクトをデプロイします。

```bash
# Deploy Bridge and ERC721 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC721 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

ブリッジとERC721ハンドラーコントラクトアドレスは次のようになります：

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC721Handler contract deployed

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
Erc20 Handler:      Not Deployed
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
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

## ステップ2：ERC721コントラクトをデプロイする {#step2-deploy-your-erc721-contract}

ERC721コントラクトをデプロイします。この例では、ハードハットプロジェクト[Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)を使用して説明します。

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

`.env`ファイルを作成し、以下の値を設定してください。

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

次に、両方のチェーンにERC721コントラクトをデプロイします。

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

デプロイに成功すると、次のようなコントラクトアドレスが得られます：

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## ステップ3：ブリッジでリソースIDを登録する {#step3-register-resource-id-in-bridge}

クロスチェーン環境でリソースを関連付けるリソースIDを登録します。

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

## ステップ4：EdgeのERC721ブリッジでミント／バーンモードを設定する {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

ブリッジはEdgeでバーン／ミントモードとして動作することを想定しています。バーン／ミントモードを設定します。

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

また、ERC721ハンドラーコントラクトにミンターとバーナーの役割を付与する必要があります。

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## ステップ5：NFTをミントする {#step5-mint-nft}

Mumbaiチェーンに新しいERC721 NFTをミントします。

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

トランザクションが成功すると、そのアカウントはミントされたNFTを持ちます。

## ステップ6：ERC721転送をスタートする {#step6-start-erc721-transfer}

このステップの開始前に、リレイヤーを開始したことを確認してください。詳細については、[セットアップ](/docs/edge/additional-features/chainbridge/setup)を確認してください。

MumbaiからEdgeへのNFT転送中に、MumbaiのERC721ハンドラーコントラクトがアカウントからNFTを引き出します。転送する前に承認を呼び出します。

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

最後にMumbaiからEdgeへのNFT転送をスタートします。

```bash
# Start transfer from Mumbai to Polygon Edge chain
$ cb-sol-cli erc721 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --id 0x50 \
  # ChainID for Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501"
```

デポジットトランザクションが成功した後、リレイヤーがイベントを獲得し、提案に投票します。  
必要な数の投票が送信された後、Polygon Edgeチェーンの受信者アカウントにNFTを送信するトランザクションを実行します。

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

実行トランザクションが成功すると、Polygon EdgeチェーンにNFTが取得されます。
