---
id: poa
title: Yetki Kanıtı (PoA)
description: "Yetki Kanıtı ile ilgili açıklama ve talimatlar."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Genel Bakış {#overview}

IBFT PoA, Polygon Edge içindeki varsayılan konsensüs mekanizmasıdır. PoA içinde doğrulayıcılar blokları oluşturmaktan ve bunları bir dizi halinde blok zinciri içine eklemekten sorumludurlar.

Tüm doğrulayıcılar dinamik bir doğrulayıcı kümesi oluşturur, burada doğrulayıcılar bir oylama mekanizması kullanılarak kümeye eklenebilir veya kümeden çıkarılabilir. Bu da doğrulayıcı düğümlerinin çoğunluğunun (%51) belli bir doğrulayıcının kümeye eklenmesi veya kümeden çıkarılması yönünde oy kullanması hâlinde, doğrulayıcıların kümeye eklenebileceği veya kümeden çıkarılabileceği anlamına gelir. Bu şekilde, kötü niyetli doğrulayıcılar ağ üzerinde tespit edilebilir ve ağdan atılabilir, aynı zamanda yeni güvenilir doğrulayıcılar ağa eklenebilir.

Tüm doğrulayıcılar yeni bloku teklif etmek için sırasını bekler (yuvarlak masa düzeni ile) ve blokun blok zinciri içinde doğrulanması/eklenmesi için doğrulayıcıların nitelikli çoğunluğunun (2/3'ten fazlası) mevzubahis bloku onaylaması gerekir.

Doğrulayıcıların yanı sıra, blok oluşturma sürecine katılmayan ancak blok doğrulama sürecine katılan doğrulayıcı olmayan düğümler de vardır.

## Doğrulayıcı kümesine bir doğrulayıcı ekleme {#adding-a-validator-to-the-validator-set}

Bu kılavuz 4 doğrulayıcı düğümlü aktif bir IBFT ağı içine yeni bir doğrulayıcı düğümünün nasıl eklenebileceğini açıklar.
Ağın kurulmasına yardım etmek istiyorsanız [Yerel Kurulum](/edge/get-started/set-up-ibft-locally.md) / [Bulut Kurulum](/edge/get-started/set-up-ibft-on-the-cloud.md) bölümlerine bakın.

### Adım 1: IBFT için veri klasörlerini başlatma ve yeni düğüm için doğrulayıcı anahtarlarını​ oluşturma {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Yeni düğümde IBFT ile kurulum yapmak ve çalıştırmaya başlamak için öncelikle veri klasörlerini başlatmanız ve anahtarları oluşturmanız gerekir:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Bu komut, doğrulayıcı anahtarını (adresinin) ve düğüm kimliğini yazdıracaktır. Bir sonraki adım için doğrulayıcı anahtarına (adresine) ihtiyacınız olacaktır.

### Adım 2: Diğer doğrulayıcı düğümlerinden yeni bir aday oluşturma {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Yeni bir düğümün doğrulayıcı olması için doğrulayıcıların en az %51'inin onun için teklifte bulunması gerekir.

Grpc adresi: 127.0.0.1:10000 üzerinde mevcut doğrulayıcı düğümünden yeni bir doğrulayıcı (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) teklif etme örneği:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

IBFT komutlarının yapısı [CLI Komutları](/docs/edge/get-started/cli-commands) bölümünde ele alınmıştır.

:::info BLS genel anahtarı

BLS genel anahtarı yalnızca ağın BLS ile çalışması hâlinde gereklidir çünkü BLS modunda çalıştırılmayan ağ için `--bls` gerekmez

:::

### Adım 3: İstemci düğümü çalıştırma {#step-3-run-the-client-node}

Bu örnekte tüm düğümlerin aynı makinede olduğu bir ağı çalıştırmayı denediğimiz için, port çakışmalarını önlemeye özel olarak dikkat etmemiz gerekir.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Tüm blokları aldıktan sonra, konsolunuzun içinde yeni bir düğümün doğrulamaya katıldığını fark edeceksiniz

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Doğrulayıcı olmayan bir düğümü doğrulayıcı olarak terfi etme

Doğal olarak, doğrulayıcı olmayan düğüm bir oylama sürecinin ardından doğrulayıcı hâline gelebilir; ancak oylama işleminden sonra doğrulayıcı kümesine başarılı bir şekilde dâhil edilebilmesi için düğümün `--seal` bayrağı ile yeniden başlatılması gerekir.

:::

## Doğrulayıcı kümesinden bir doğrulayıcıyı kaldırma {#removing-a-validator-from-the-validator-set}

Bu işlem oldukça basittir. Doğrulayıcı kümesinden bir doğrulayıcı düğümü kaldırmak için bu komutun doğrulayıcı düğümlerinin çoğunluğu için gerçekleştirilmesi gerekir.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info BLS genel anahtarı

BLS genel anahtarı yalnızca ağın BLS ile çalışması hâlinde gereklidir çünkü BLS modunda çalıştırılmayan ağ için `--bls` gerekmez

:::

Komutlar gerçekleştirildikten sonra, doğrulayıcı sayısının düştüğü gözlemleyin (bu günlük örneğinde 4'ten 3'e).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````
