---
id: use-case-erc721-bridge
title: Kullanım durumu - ERC721 Köprüsü
description: ERC721 sözleşme köprüsüne ilişkin örnek
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Bu bölüm, pratik bir kullanım durumu için size ER721 Köprü kurulum akışını sağlamayı amaçlamaktadır.

Bu kılavuzda Mumbai Polygon PoS test ağını ve Polygon Edge yerel ağını kullanacaksınız. Lütfen Mumbai için JSON-RPC uç noktasına sahip olduğunuzdan ve yerel ortamda Polygon Edge kurulumunu yaptığınızdan emin olun. Daha fazla bilgi için lütfen [Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally) veya [Bulut Kurulumu](/docs/edge/get-started/set-up-ibft-on-the-cloud) bölümüne başvurun.

## Senaryo {#scenario}

Bu senaryo, normal bir durumda olan kullanıcılar için özel bir zincirde (Polygon Edge) düşük maliyetli aktarımı etkinleştirmek için halihazırda genel zincirde (Polygon POS) devreye alınmış ERC721 NFT için bir köprü kurmaktır. Böyle bir durumda, orijinal meta veriler genel zincir içinde tanımlanmıştır ve yalnızca genel zincirden aktarılan NFT'ler özel zincir içinde mevcut olabilir. Bu nedenle, genel zincir içinde kilitleme/serbest bırakma modunu kullanmanız ve özel zincirde yakma/mint modunu kullanmanız gerekecektir.

Genel zincirden özel zincire NFT'leri gönderirken, NFT genel zincirde ERC721 İşleyici sözleşmesinde kilitlenecek ve aynı NFT özel zincirde mint edilecektir. Öte yandan, özel zincirden genel zincire aktarım durumunda, özel zincirdeki NFT yakılacak ve genel zincirde aynı NFT ERC721 İşleyici sözleşmesinden serbest bırakılacaktır.

## Sözleşmeler {#contracts}

ChainBridge tarafından geliştirilen sözleşme yerine basit bir ERC721 sözleşmesi ile açıklama. Yakma/mint etme modu için, ERC721 sözleşmesi, ERC721'de tanımlanan yöntemlere ek olarak  `mint` ve `burn` yöntemlerine sahip olmalıdır:

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

Tüm kodlar ve komut dizileri Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example) içinde bulunur.

## Adım 1: Köprü ve ERC721 İşleyici sözleşmelerini devreye alın {#step1-deploy-bridge-and-erc721-handler-contracts}

Öncelikle, her iki zincirde `cb-sol-cli` kullanarak Köprü ve ERC721 İşleyici sözleşmelerini devreye alacaksınız.

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

Köprü ve ERC721 İşleyici sözleşme adreslerini aşağıdaki gibi alacaksınız:

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

## Adım 2: ERC721 sözleşmesini devreye alın {#step2-deploy-your-erc721-contract}

ERC721 sözleşmesini devreye alacaksınız. Bu örnek, hardhat projesi [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example) için size rehberlik eder.

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Lütfen `.env` dosyasını oluşturun ve aşağıdaki değerleri ayarlayın.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Ardından, her iki zincirde ERC721 sözleşmesini devreye alacaksınız.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Devreye alma başarılı olduktan sonra, aşağıdaki gibi bir sözleşme adresi alacaksınız:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Adım 3: Köprüye kaynak kimliğini kaydedin {#step3-register-resource-id-in-bridge}

Zincirler arası bir ortamda kaynakları ilişkilendiren bir kaynak kimliği kaydedeceksiniz.

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

## Adım 4: Edge üzerinde ERC721 köprüsünde Mint Etme/Yakma modunu ayarlayın {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Köprü, Edge'de yakma/mint etme modunda çalışmayı bekler. Yakma/mint etme modunu ayarlayacaksınız.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

Ve ERC721 İşleyici sözleşmesi için bir mint edici ve yakıcı rolü vermeniz gerekir.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Adım 5: NFT'yi mint edin {#step5-mint-nft}

Mumbai zincirinde ERC721 NFT'yi mint edeceksiniz.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

İşlem başarılı olduktan sonra, hesap mint edilen NFT'lere sahip olacaktır.

## Adım 6: ERC721 aktarımını başlatın {#step6-start-erc721-transfer}

Bu adıma başlamadan önce, lütfen yönlendiriciyi başlattığınızdan emin olun. Daha fazla bilgi için lütfen [Kurulum](/docs/edge/additional-features/chainbridge/setup) kısmına göz atın.

Mumbai'den Edge'e NFT aktarımı sırasında, Mumbai'deki ERC721 İşleyici sözleşmesi, hesabınızdan NFT'yi çeker. Aktarıma başlamadan önce approve çağrısını yapacaksınız.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Son olarak, Mumbai'den Edge'e NFT aktarımına başlayacaksınız.

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

Fon yatırma işlemi başarılı olduktan sonra, yönlendirici olayı almalı ve teklif için oy kullanmalıdır.  
Gerekli sayıda oy gönderildikten sonra Polygon Edge zincirindeki alıcı hesabına NFT'yi göndermek için bir işlem yürütür.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Yürütme işlemi başarılı olduktan sonra, Polygon Edge zincirinde üzerinde NFT'yi alacaksınız.
