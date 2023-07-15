---
id: troubleshooting
title: Sorun Giderme
description: "Polygon Edge için Sorun Giderme bölümü"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Sorun Giderme {#troubleshooting}

## `method=eth_call err="invalid signature"` hatası {#error}

Polygon Edge ile işlem yapmak için bir cüzdan kullanıyorsanız, cüzdanınızın yerel ağ kurulumunda şunlara dikkat edin:

1. `chainID` doğru olmalıdır. Edge için varsayılan `chainID`, `100` şeklindedir; fakat `--chain-id` genesis bayrağı kullanılarak özelleştirilebilir.

````bash
genesis [--chain-id CHAIN_ID]
````
2. “RPC URL” alanında, bağlandığınız düğümün JSON RPC portunu kullandığınızdan emin olun.


## WebSocket URL'si nasıl alınır? {#how-to-get-a-websocket-url}

Polygon Edge çalıştırdığınızda, varsayılan olarak zincir konumuna göre bir WebSocket uç noktasını açığa çıkarır.
HTTPS bağlantıları için `wss://`, HTTP için `ws://` URL şeması kullanılır.

Localhost WebSocket URL:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Port sayısının düğüm için seçilen JSON-RPC portuna bağlı olduğunu unutmayın.

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## Bir sözleşmeyi devreye almaya çalışırken alınan `insufficient funds` hatası {#error-when-trying-to-deploy-a-contract}

Bu hatayı alıyorsanız, istenen adres üzerinde yeterince fon bulundurduğunuzdan ve kullanılan adresin doğru olduğundan emin olun.<br/>
Önceden mine edilen bakiyeyi ayarlamak için, genesis dosyasını oluştururken `genesis [--premine ADDRESS:VALUE]` genesis bayrağını kullanabilirsiniz.
Bu bayrağı kullanma örneği:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Bunu yapmak 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 üzerinde 1000000000000000000000 WEI'yi önceden mine eder.


## Chainbridge kullanılırken serbest bırakılmayan ERC20 token'ları {#erc20-tokens-not-released-while-using-chainbridge}

Polygon POS ve yerel bir Edge ağı arasında ERC20 token'larını aktarmaya çalışıyorsanız ve ERC20 token'larınız yatırıldıysa, teklif de yönlendiricide yürütüldüyse ancak token'larınız Edge ağınızda serbest bırakılmıyorsa, Polygon Edge zincirindeki ERC20 İşleyicisinin serbest bırakacak yeterince token'ı olduğundan emin olun. <br/>
Hedef zincir içindeki İşleyici sözleşmesi, kilit kaldırma modu için serbest bırakacak yeterince token'a sahip olmalıdır. Yerel Edge ağınızın ERC20 İşleyicisinde ERC20 token'ınız yoksa, yeni token mint edin ve ERC20 İşleyici'ye aktarın.

## Chainbridge kullanılırken alınan `Incorrect fee supplied` hatası {#error-when-using-chainbridge}

Bu hatayı Mumbai Polygon POS zinciri ve yerel bir Polygon Edge kurulumu arasında ERC20 token'larını aktarmaya çalışırken alabilirsiniz. Bu hata, `--fee` bayrağını kullanarak dağıtım ücretini ayarladığınız ancak fon yatırma işleminde aynı değeri ayarlamadığınız zaman ortaya çıkar.
Ücreti değiştirmek için aşağıdaki komutu kullanabilirsiniz:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Bu bayrak hakkında daha fazla bilgiyi [buradan](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md) bulabilirsiniz.





