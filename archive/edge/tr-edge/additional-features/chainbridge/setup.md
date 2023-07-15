---
id: setup
title: Kurulum
description: chainBridge nasıl kurulur?
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Sözleşmeleri devreye alma {#contracts-deployment}

Bu bölümde, Polygon PoS ve Polygon Edge için gerekli sözleşmeleri `cb-sol-cli` kullanarak devreye alacaksınız.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Öncelikle, `cb-sol-cli deploy` komutunu kullanarak sözleşmeleri Polygon PoS zinciri üzerinde devreye alacağız.  `--all` bayrağı; komutun Köprü, ERC20 İşleyicisi, ERC721 İşleyicisi, Jenerik İşleyici, ERC20 ve ERC 721 sözleşmesi dâhil tüm sözleşmeleri devreye almasını sağlar. Buna ek olarak, varsayılan yönlendirici hesap adresini ve eşiğini ayarlar

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


chainID ve JSON-RPC URL hakkında [buradan](/docs/edge/additional-features/chainbridge/definitions) bilgi edinin

:::caution

`cb-sol-cli` üzerindeki varsayılan gaz fiyatı `20000000` olarak belirlenmiştir (`0.02 Gwei`). Bir işlem içinde uygun gaz fiyatını ayarlamak için `--gasPrice` argümanını kullanarak değeri belirleyin.

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

Köprü sözleşmesinin devreye alınması için yaklaşık 0x3f97b8 (4167608) gaz gerekir. Lütfen oluşturulan blokların sözleşme oluşturma işlemini kapsayacak kadar blok gaz limitine sahip olduğundan emin olun. Polygon Edge üzerinde blok gaz limitini değiştirme hakkında daha fazla bilgi edinmek için lütfen
[Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally) kısmını ziyaret edin

:::

Sözleşmeler devreye alındıktan sonra aşağıdaki sonucu alacaksınız:

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

Artık sözleşmeleri Polygon Edge zinciri üzerinde devreye alabiliriz.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Bir sonraki adım için ihtiyaç duyacağımız devreye alınmış akıllı sözleşme adreslerini içeren terminal çıktılarını kaydedin.

## Yönlendirici kurulumu {#relayer-setup}

Bu bölümde, iki zincir arasında değişim için bir yönlendirici başlatacaksınız.

Önce ChainBridge bilgi deposunu klonlayıp oluşturmamız gerekir.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Ardından, her zincir için `config.json` oluşturmalı ve JSON-RPC URL'lerini, yönlendirici adresini ve sözleşme adresini ayarlamalısınız.

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

Bir yönlendirici başlatmak için yönlendirici hesap adresine karşılık gelen özel anahtarı içe aktarmanız gerekir. Özel anahtarı içe aktarırken bir şifre girmeniz gerekecektir. İçe aktarma başarılı olduktan sonra, anahtar `keys/<ADDRESS>.key` altında depolanacaktır.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Bundan sonra, yönlendiriciyi başlatabilirsiniz. Başlangıçta anahtarı depolamak için seçtiğiniz şifrenin aynısını girmeniz gerekecektir.

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

Yönlendirici çalışmaya başladıktan sonra, her zincir üzerinde yeni blokları izlemeye başlayacaktır.
