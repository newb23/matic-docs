---
id: setup-erc20-transfer
title: ERC20 Token Aktarımı
description: ChainBridge'de ERC-20 aktarımı nasıl kurulur?
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Şimdiye kadar varlıkları/verileri Polygon PoS ve Polygon Edge zincirleri arasında değiş tokuş etmek için köprü kurduk. Bu bölüm, bir ERC20 köprüsü kurmanız ve farklı blok zincirleri arasında token'ları göndermeniz için size kılavuz olacaktır.

## 1. Adım: Kaynak kimliğini kaydetme {#step-1-register-resource-id}

Öncelikle, zincirler arası bir ortamda kaynakları ilişkilendiren bir kaynak kimliği kaydedeceksiniz. Kaynak Kimliği, bu blok zincirleri arasında aktardığımız kaynağa özgü olması gereken 32 baytlık bir değerdir. Kaynak kimlikleri rastgeledir, ancak bir kural olarak son baytta ana zincirin zincir kimliğini alabilirler (ana zincir, bu kaynakların nereden geldiğini belirten ağı işaret eder).

Kaynak kimliğini kaydetmek için `cb-sol-cli bridge register-resource` komutunu kullanabilirsiniz. `admin` hesabının özel anahtarını vermeniz gerekecektir.

```bash
# For Polygon PoS chain
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"

# For Polygon Edge chain
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## (İsteğe bağlı) Sözleşmeleri mint edilebilir/yakılabilir yapın {#optional-make-contracts-mintable-burnable}


```bash
# Let ERC20 contract burn on source chain and mint on destination chain
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"

# Grant minter role to ERC20 Handler contract
$ cb-sol-cli erc20 add-minter \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --minter "[ERC20_HANDLER_CONTRACT_ADDRESS]"
```

## 2. Adım: ERC20 Token Aktarımı {#step-2-transfer-erc20-token}

Polygon PoS zincirinden Polygon Edge zincirine ERC20 Token'ları göndereceğiz.

Önce mint ederek token'ları alacaksınız. `minter` rolüne sahip bir hesap, yeni token'ları mint edebilir. ERC20 sözleşmesini devreye alan hesap, varsayılan olarak `minter` rolüne sahiptir. `minter` rolünün üyeleri olarak diğer hesapları belirtmek için `cb-sol-cli erc20 add-minter` komutunu çalıştırmanız gerekir.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

Mevcut bakiyeyi denetlemek için `cb-sol-cli erc20 balance` komutunu kullanabilirsiniz.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

Ardından, ERC20 İşleyicisi tarafından hesap üzerinden ERC20 token aktarımını onaylamanız gerekir

```bash
# Approve transfer from the account by ERC20 Handler
$ cb-sol-cli erc20 approve \
  --url https://rpc-mumbai.matic.today \
  --privateKey [USER_ACCOUNT_ADDRESS] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --recipient "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --amount 500
```

Token'ları Polygon Edge zincirlerine aktarmak için `deposit` çağırmalısınız.

```bash
# Start transfer from Polygon PoS to Polygon Edge chain
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

Fon yatırma işlemi başarılı olduktan sonra, yönlendirici olayı alacak ve teklif için oy kullanacaktır. Gerekli sayıda oy gönderildikten sonra, Polygon Edge zincirindeki hesap adresine token'ları göndermek için bir işlem yürütür.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Yürütme işlemi başarılı olduğunda, Polygon Edge zincirinde token'ları alabilirsiniz.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```
