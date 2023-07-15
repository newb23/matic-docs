---
id: set-up-ibft-locally
title: Lokal na Pag-Setup
description: "Step-by-step na gabay sa lokal na pag-setup."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Ang gabay na ito ay para lang sa mga layunin sa pagsubok

Tuturuan ka ng gabay sa ibaba kung paano mag-set up ng Polygon Edge network sa iyong lokal na machine para sa mga layunin sa pagsubok at
pag-develop.

Ang pamamaraan ay lubos na naiiba sa paraan kung paano mo gustong mag-set up ng Polygon Edge network para sa scenario ng totoong paggamit sa
isang cloud provider: **[Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## Mga Kinakailangan {#requirements}

Sumangguni sa [Pag-install](/docs/edge/get-started/installation) para i-install ang Polygon Edge.

## Pangkalahatang-ideya  {#overview}

![Lokal na Pag-Setup](/img/edge/ibft-setup/local.svg)

Sa gabay na ito, ang layunin natin ay magtatag ng isang gumaganang `polygon-edge`blockchain network na gumagana sa [protokol ng consensus ng IBFT](https://github.com/ethereum/EIPs/issues/650).
Ang blockchain network ay bubuuin ng 4 na node kung saan ang 4 na ito ay mga validator node, at dahil dito, kwalipikado ang mga ito para sa proposing block at mga nagba-validate na block na nagmula sa iba pang proposer.
Ang 4 na node ay tatakbo sa parehong machine, dahil ang layunin ng gabay na ito ay magbigay sa iyo ng ganap na gumaganang IBFT cluster sa loob ng pinakamaikling panahon.

Para magawa iyon, gagabayan ka namin sa pamamagitan ng 4 na madaling hakbang:

1. Kapag nagsimula ng mga data directory, mabubuo ang mga validator key para sa bawat isa sa 4 na node, at magsisimula ito ng mga walang lamang data directory ng blockchain. Mahalaga ang mga validator key dahil kailangan nating i-bootstrap ang genesis block sa pamamagitan ng paunang set ng mga validator gamit ang mga key na ito.
2. Ang paghahanda sa connection string para sa bootnode ay magiging mahalagang impormasyon para sa bawat node na papatakbuhin natin kaugnay sa kung sa aling node kokonekta kapag nagsisimula sa kauna-unahang pagkakataon.
3. Ang pagbuo sa `genesis.json` file ay mangangailangan, bilang input, ng magkaparehong mga validator key na nabuo sa **hakbang 1** na ginamit para sa pagtatakda ng mga paunang validator ng network sa genesis block at ng bootnode connection string mula sa **hakbang 2**.
4. Ang pagpapatakbo sa lahat ng node ay ang pinal na layunin ng gabay na ito at ito ang magiging huling hakbang na gagawin natin, iuutos natin sa mga node kung aling data directory ang gagamitin, at kung saan hahanapin ang `genesis.json` na nagbu-bootstrap sa paunang state ng network.

Dahil lahat ng apat na node ay tatakbo sa localhost, sa panahon ng proseso ng pag-setup, inaasahan na ang lahat ng data directory
para sa bawat isa sa mga node ay nasa iisang parent directory.

:::info Bilang ng mga validator

Walang minimum sa bilang ng mga node sa isang cluster, na nangangahulugang ang mga cluster na may 1 lang na validator node ay posible.
Tandaan na sa pamamagitan ng _single_ node cluster, **walang crash tolerance** at **walang BFT guarantee**.

Ang minimum na inirerekomendang bilang ng mga node para makakamit ng BFT guarantee ay 4 - dahil sa isang 4 na node cluster, ang pagpalya ng
1 node ay maaaring i-tolerate, hangga't gumagana nang normal ang 3 natitira.

:::

## Hakbang 1: Magsimula ng mga folder ng data para sa IBFT at bumuo ng mga validator key {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Para masimulan at mapatakbo ang IBFT, kailangan mong simulan ang mga folder ng data,
isa para sa bawat node:

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

Ipi-print ng bawat isa sa mga command na ito ang validator key, bls public key, at [node ID](https://docs.libp2p.io/concepts/peer-id/). Kakailanganin mo ang Node ID ng unang node para sa susunod na hakbang.

### Mga output Secret {#outputting-secrets}
Maaaring i-retrieve ulit ang output ng lihim, kung kinakailangan.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Hakbang 2: Ihanda ang multiaddr connection string para sa bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Para matagumpay na makagawa ng koneksyon ang isang node, alam dapat nito kung sa aling `bootnode`server kokonekta para makakuha ng
impormasyon tungkol sa lahat ng natitirang node sa network. Kilala rin minsan ang `bootnode` bilang `rendezvous` server sa p2p jargon.

Ang `bootnode` ay hindi espesyal na instance ng polygon-edge node. Maaaring magsilbi bilang `bootnode` ang bawat polygon-edge node, ngunit
ang bawat polygon-edge node ay kailangang magkaroon ng set ng mga bootnode na tinukoy na ikokontak para magbigay ng impormasyon tungkol sa kung paano kumonekta sa
lahat ng natitirang node sa network.

Para magawa ang connection string para sa pagtukoy sa bootnode, kakailanganin nating sundin
ang [multiaddr format](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

Sa gabay na ito, ituturing natin ang unang node at pangalawang node bilang mga bootnode para sa lahat ng iba pang node. Ang mangyayari sa scenario na ito ay
ang mga node na kumokonekta sa `node 1` o `node 2` ay makakakuha ng impormasyon tungkol sa kung paano kumonekta sa isa pa sa pamamagitan ng parehong
nakontak na bootnode.

:::info Kailangan mong tumukoy ng hindi bababa sa isang bootnode para makapagsimula ng node

Nangangailangan ng hindi bababa sa **isang** bootnode para magawa ng iba pang node sa network na ma-discover ang isa't isa. Inirerekomenda ang mas maraming node, dahil
ang mga ito ay nagbibigay ng katatagan sa network kung sakaling magkaroon ng mga outage.
Sa gabay na ito, maglilista tayo ng dalawang node, ngunit maaari itong baguhin nang mabilisan, nang walang epekto sa pagiging valid ng `genesis.json` na file.

:::

Dahil tumatakbo tayo sa localhost, ligtas na ipagpalagay na ang `<ip_address>` ay `127.0.0.1`.

Para sa `<port>`, gagamitin natin ang `10001` dahil iko-configure natin ang libp2p server para sa `node 1` na papakinggan sa port na ito sa ibang pagkakataon.

At panghuli, kailangan natin ang `<node_id>` na maaari nating makuha sa output ng dating pinatakbong command na `polygon-edge secrets init --data-dir test-chain-1` command (na ginamit para bumuo ng mga key at data directory para sa `node1`)

Pagkatapos ng pagbuo, ang multiaddr connection string sa `node 1` na gagamitin natin bilang bootnode ay magiging parang ganito (ang `<node_id>` lang na nasa dulo ay naiiba dapat):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Sa katulad na paraan, binubuo natin ang multiaddr para sa pangalawang bootnode gaya ng ipinapakita sa ibaba ng
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info mga DNS hostname sa halip na ips

Sumusuporta ang Polygon Edge gamit ang mga DNS hostname para sa configuration ng mga node. Lubos na kapaki-pakinabang na feature ito para sa mga cloud based na deployment, dahil ang ip ng node ay maaaring magbago dahil sa iba't ibang dahilan.

Ang multiaddr format para sa connection string habang ginagamit ang mga DNS hostname ay gaya ng sumusunod:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Hakbang 3: Buuin ang genesis file gamit ang 4 na node bilang mga validator {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Ang ginagawa ng command na ito:

* Itinatakda ng `--ibft-validators-prefix-path` ang prefix folder path sa tinukoy kung aling IBFT sa Polygon Edge ang maaaring
gamitin. Ginagamit ang directory na ito para panatilihin ang `consensus/` folder, kung saan nakalagay ang pribadong key ng validator. Ang
pampublikong key ng validator ay kinakailangan para magawa ang genesis file - ang paunang listahan ng mga bootstrap node.
Lohikal lang ang flag na ito kapag sine-set up ang network sa localhost, dahil sa real-world na scenario, hindi tayo maaaring umasa na ang lahat ng
data directory ng mga node ay nasa iisang filesystem kung saan madali nating mababasa ang pampublikong key ng mga ito.
* Itinatakda ng `--bootnode` ang address ng bootnode na magbibigay-daan sa mga node na mahanap ng mga ito ang isa't isa.
Gagamitin natin ang multiaddr string ng `node 1`, tulad ng nabanggit sa **hakbang 2**.

Ang resulta ng command na ito ay ang file na `genesis.json` na naglalaman ng genesis block ng aming bagong blockchain, kasama ang paunang natukoy na validator set at ang configuration kung aling node ang unang kokontakin para makagawa ng koneksyon.

:::info Lumipat sa ECDSA

Ang BLS ang default na validation mode ng mga block header. Kung gusto mong tumakbo ang iyong chain sa ECDSA mode, magagamit mo ang flag `—ibft-validator-type`, gamit ang `ecdsa`argument:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Mga premining na balanse ng account

Marahil ay gusto mong i-set up ang iyong blockchain network nang may mga "premined" na balanse ang ilang address.

Para magawa ito, magpasa ng maraming `--premine` flag na gusto mo ayon sa address na gusto mong simulan nang may partikular na balanse
sa blockchain.

Halimbawa, kung gusto nating mag-premine ng 1000 ETH sa address na `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` sa ating genesis block, kakailanganin nating ibigay ang sumusunod na argumento:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Tandaang ang na-premine na halaga ay nasa WEI, hindi ETH.**

:::

:::info Itakda ang block gas limit

Ang default na gas limit kada block ay `5242880`. Ang value na ito ay nakasulat sa genesis file, ngunit kung gusto mo, maaari mo itong
dagdagan / bawasan.

Para gawin ito, maaari mong gamitin ang flag na `--block-gas-limit` na sinusundan ng gustong value gaya ng ipinapakita sa ibaba:

```shell
--block-gas-limit 1000000000
```
:::

:::info Itakda ang file descriptor limit ng system

Maaaring mababa ang default na file descriptor limit (maximum na bilang ng mga bukas na file) at sa Linux, ang lahat ay isang file. Kung inaasahang magkakaroon ng mataas na throughput ang mga node, maaari mong isaalang-alang ang pagtaas ng limitasyong ito. I-check ang mga opisyal na docs ng iyong linux distro para sa karagdagang detalye.

#### Tingnan ang mga kasalukuyang limitasyon ng os (mga bukas na file) {#check-current-os-limits-open-files}
```shell title="ulimit -n"
1024 # Ubuntu default
```

#### Dagdagan ang limitasyon sa mga bukas na file {#increase-open-files-limit}
- Tumatakbo `polygon-edge`sa foreground (shell)
  ```shell title="Set FD limit for the current session"
  ulimit -n 65535 # affects only current session, limit won't persist after logging out
  ```

  ```shell title="Edit /etc/security/limits.conf"
  # add the following lines to the end of the file to modify FD limits
  *               soft    nofile          65535 # sets FD soft limit for all users
  *               hard    nofile          65535 # sets FD hard limit for all users

  # End of file
  ```
I-save ang file at i-restart ang system.

- Tumatakbo `polygon-edge`sa background bilang serbisyo

Kung `polygon-edge`tumakbo bilang serbisyo ng system, gamit ang tool tulad ng , nililimitahan ng descriptor ng `systemd`file dapat na pinamamahalaan ang paggamit ng `systemd`.
  ```shell title="Edit /etc/systemd/system/polygon-edge.service"
  [Service]
   ...
  LimitNOFILE=65535
  ```

### Pag-troubleshoot {#troubleshooting}
```shell title="Watch FD limits of polygon edge running process"
watch -n 1 "ls /proc/$(pidof polygon-edge)/fd | wc -l"
```

```shell title="Check max FD limits for polygon-edge running process"
cat /proc/$(pidof polygon-edge)/limits
```
:::


## Hakbang 4: Patakbuhin ang lahat ng client {#step-4-run-all-the-clients}

Dahil sinusubukan nating magpatakbo ng Polygon Edge network na may 4 na node sa iisang machine, kailangan nating mag-ingat para
maiwasan ang mga conflict sa port. Ito ang dahilan kung bakit gagamitin natin ang sumusunod na rason para sa pagtukoy sa mga port sa pakikinig ng bawat server ng node:

- `10000` para sa gRPC server ng `node 1`, `20000` para sa GRPC server ng `node 2`, atbp.
- `10001` para sa libp2p server ng `node 1`, `20001` para sa libp2p server ng `node 2`, atbp.
- `10002` para sa JSON-RPC server ng `node 1`, `20002` para sa JSON-RPC server ng `node 2`, atbp.

Para patakbuhin ang **unang** client (tandaan ang port `10001` dahil ginamit ito bilang bahagi ng libp2p multiaddr sa **hakbang 2** kasama ang Node ID ng node 1):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Para patakbuhin ang **pangalawang** client:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Para patakbuhin ang **pangatlong** client:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Para patakbuhin ang **pang-apat** na client:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Para mabilis na suriin kung ano na ang nagawa sa ngayon:

* Ang directory para sa data ng client ay tinukoy bilang **./test-chain-\***
* Ang mga GRPC server ay sinimulan na sa mga port **10000**, **20000**, **30000** at **40000**, para sa bawat node ayon sa pagkakasunud-sunod ng mga ito
* Ang mga libp2p server ay sinimulan na sa mga port **10001**, **20001**, **30001** at **40001**, para sa bawat node ayon sa pagkakasunud-sunod ng mga ito
* Ang mga JSON-RPC server ay sinimulan na sa mga port **10002**, **20002**, **30002** at **40002**, para sa bawat node ayon sa pagkakasunud-sunod ng mga ito
* Ang *seal* flag ay nangangahulugan na ang node na sinisimulan ay lalahok sa pag-seal ng block
* Tinutukoy ng *chain* flag kung aling genesis file ang dapat gamitin para sa configuration ng chain

Ang istruktura ng genesis file ay tinatalakay sa seksyong [Mga CLI Command](/docs/edge/get-started/cli-commands).

Pagkatapos patakbuhin ang mga naunang command, nakapag-set up ka na ng 4 na node na Polygon Edge network na may kakayahang mag-seal ng mga block at mag-recover
pagkatapos pumalya ang node.

:::info Simulan ang client gamit ang config file

Sa halip na tukuyin ang lahat ng paramater ng configuration bilang mga argumento sa CLI, maaari ring simulan ang Client gamit ang isang config file sa pamamagitan ng pagsasagawa sa sumusunod na command:

````bash
polygon-edge server --config <config_file_path>
````
Halimbawa:

````bash
polygon-edge server --config ./test/config-node1.json
````
Sa kasalukuyan, sinusuportahan namin `yaml`at `json`batay **[sa](/docs/edge/configuration/sample-config)** mga configuration files, makikita ang mga sample config files dito

:::

:::info Mga hakbang para makapagpatakbo ng non-validator node

Isi-sync palagi ng Non-validator ang mga pinakabagong block na natanggap mula sa validator node, maaari kang magsimula ng non-validator node sa pamamagitan ng pagpapatakbo sa sumusunod na command.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Halimbawa, maaari kang magdagdag ng **panlimang** Non-validator client sa pamamagitan ng pagsasagawa ng sumusunod na command:

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Tukuyin ang limitasyon sa presyo

Ang isang Polygon Edge node ay maaaring simulan nang may nakatakdang **limitasyon sa presyo** para sa mga papasok na transaksyon.

Ang unit para sa limitasyon sa presyo ay `wei`.

Kapag nagtakda ng limitasyon sa presyo, nangangahulugan ito na ang anumang transaksyon na naiproseso ng kasalukuyang node ay kailangang magkaroon ng gas price na **mas mataas**
kaysa sa itinakdang limitasyon sa presyo, kung hindi, hindi ito isasama sa isang block.

Ang pagsunod ng karamihan ng mga node sa partikular na limitasyon sa presyo ay nagpapatupad sa panuntunan na ang mga transaksyon sa network ay
hindi maaaring mas mababa sa partikular na threshold sa presyo.

Ang default na value para sa limitasyon sa presyo ay `0`, ibig sabihin, hindi talaga ito ipinapatupad bilang default.

Halimbawa ng paggamit sa `--price-limit` flag:
````bash
polygon-edge server --price-limit 100000 ...
````

Mahalaga ring banggitin na ang mga limitasyon sa presyo **ay ipinapatupad lang sa mga hindi lokal na transaksyon**, ibig sabihin
na ang limitasyon sa presyo ay hindi nalalapat sa mga transaksyon na lokal na idinagdag sa node.

:::

:::info WebSocket URL

Bilang default, kapag pinatakbo mo ang Polygon Edge, bumubuo ito ng WebSocket URL batay sa lokasyon ng chain.
Ang URL scheme na `wss://` ay ginagamit para sa mga HTTPS link, at `ws://` para sa HTTP.

Localhost WebSocket URL:
````bash
ws://localhost:10002/ws
````
Mangyaring tandaan na ang port number ay nakadepende sa napiling JSON-RPC port para sa node.

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Hakbang 5: Magkipag-interaksyon sa polygon-edge network {#step-5-interact-with-the-polygon-edge-network}

Ngayong nakapag-set up ka ng kahit 1 lang na tumatakbong client, maaari ka nang makipag-interaksyon sa blockchain gamit account na na-premine mo sa itaas
at sa pamamagitan ng pagtukoy sa JSON-RPC URL sa alinman sa 4 na node:
- Node 1: `http://localhost:10002`
- Node 2: `http://localhost:20002`
- Node 3: `http://localhost:30002`
- Node 4: `http://localhost:40002`

Sundin ang gabay na ito para magbigay ng mga operator command sa bagong gawang cluster: [Paano mag-query ng impormasyon tungkol sa operator](/docs/edge/working-with-node/query-operator-info) (ang mga GRPC port para sa cluster na ginawa natin ay `10000`/`20000`/`30000`/`40000` para sa bawat node ayon sa pagkakasunud-sunod ng mga ito)
