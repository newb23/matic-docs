---
id: use-case-erc20-bridge
title: Kullanım durumu - ERC20 Köprüsü
description: ERC20 sözleşmesini köprüleme örneği
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Bu bölüm, pratik bir kullanım durumu için size ERC20 Köprü kurulum akışını sağlamayı amaçlamaktadır.

Bu kılavuzda Mumbai Polygon PoS test ağını ve Polygon Edge yerel ağını kullanacaksınız. Lütfen Mumbai için JSON-RPC uç noktasına sahip olduğunuzdan ve yerel ortamda Polygon Edge kurulumunu yaptığınızdan emin olun. Daha fazla bilgi için lütfen [Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally) veya [Bulut Kurulumu](/docs/edge/get-started/set-up-ibft-on-the-cloud) bölümüne başvurun.

## Senaryo {#scenario}

Bu senaryo, olağan durumdaki kullanıcıların özel bir zincir üzerinde düşük maliyetli aktarımlarına olanak tanımak için genel zincirde (Polygon PoS) zaten devreye alınmış bir ERC20 token Köprüsü kurmayı kapsar. Böyle bir durumda, toplam token arzı genel zincir üzerinde tanımlanmıştır. Genel zincirden özel zincire aktarılmış olan token miktarı, özel zincirde mevcut olmalıdır. Bu nedenle, genel zincir içinde kilitleme/serbest bırakma modunu kullanmanız ve özel zincirde yakma/mint modunu kullanmanız gerekecektir.

Genel zincirden özel zincire token gönderirken, token genel zincirin ERC20 İşleyici sözleşmesinde kilitlenecek ve aynı miktarda token özel zincirde mint edilecektir. Öte yandan, özel zincirden genel zincire aktarım durumunda, özel zincirdeki token yakılır ve genel zincirde aynı miktarda token ERC20 İşleyici sözleşmesinden serbest bırakılır.

## Sözleşmeler {#contracts}

ChainBridge tarafından geliştirilen sözleşmenin yerine basit bir ERC20 sözleşmesi ile açıklama. Yakma/mint modu için ERC20 sözleşmesinin, ERC20 için yöntemlerin yanı sıra aşağıdakiler gibi `mint` ve `burnFrom` yöntemlerine sahip olması gerekir:

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

Tüm kodlar ve komut dizileri Github Repo üzerinde [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example) içinde bulunur.

## Adım 1: Köprü ve ERC20 İşleyici sözleşmelerini devreye alın {#step1-deploy-bridge-and-erc20-handler-contracts}

Öncelikle, her iki zincirde `cb-sol-cli` kullanarak Köprü ve ERC20Handler sözleşmelerini devreye alacaksınız.

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

Köprü ve ERC20Handler sözleşme adreslerini aşağıdaki gibi alacaksınız:

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

## Adım 2: ERC20 sözleşmenizi devreye alın {#step2-deploy-your-erc20-contract}

ERC20 sözleşmenizi devreye alacaksınız. Bu örnek, hardhat projesi [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example) için size rehberlik eder.

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

Ardından, her iki zincirde ERC20 sözleşmesi devreye alacaksınız.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Kurulum başarılı olduktan sonra, aşağıdaki gibi bir sözleşme adresi alacaksınız:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Adım 3: Köprü üzerinde kaynak kimliğini kaydedin {#step3-register-resource-id-in-bridge}

Zincirler arası bir ortamda kaynakları ilişkilendiren bir kaynak kimliği kaydedeceksiniz. Her iki zincirde aynı kaynak kimliğini ayarlamanız gerekir.

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

## Adım 4: Edge üzerinde ERC20 köprüsü için Mint/Yakma modunu ayarlayın {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Köprünün, Polygon Edge üzerinde yakma/mint modunda çalışması beklenir. `cb-sol-cli` kullanarak yakma/mint modunu ayarlayacaksınız.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Ayrıca, ERC20 İşleyici sözleşmesi için bir mint ve yakma rolü atamanız gerekir.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Adım 5: Token mint edin {#step5-mint-token}

Mumbai zinciri üzerinde yeni ERC20 token'ları mint edeceksiniz.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

İşlem başarılı olduktan sonra, hesap mint edilen token'lara sahip olacaktır.

## Adım 6: ERC20 aktarımını başlatın {#step6-start-erc20-transfer}

Bu adıma başlamadan önce, lütfen bir yönlendirici başlattığınızdan emin olun. Daha fazla bilgi için lütfen [Kurulum](/docs/edge/additional-features/chainbridge/setup) kısmına göz atın.

Mumbai'den Edge üzerine token aktarımı yaparken, Mumbai üzerindeki ERC20 İşleyici sözleşmesi hesabınızdan token çeker. Aktarıma başlamadan önce approve çağrısını yapacaksınız.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Son olarak, `cb-sol-cli` kullanarak Mumbai'den Edge'e token aktarımına başlayacaksınız.

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

Fon yatırma işlemi başarılı olduktan sonra, yönlendirici olayı alacak ve teklifi oylayacaktır. Gerekli sayıda oy gönderildikten sonra, Polygon Edge zincirindeki hesap adresine token'ları göndermek için bir işlem yürütür.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Yürütme işlemi başarılı olduktan sonra, Polygon Edge zinciri üzerinde token'ları alacaksınız.
