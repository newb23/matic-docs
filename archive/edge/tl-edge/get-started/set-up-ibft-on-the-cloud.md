---
id: set-up-ibft-on-the-cloud
title: Pag-Setup sa Cloud
description: "Step-by-step na gabay sa pag-setup sa cloud."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Ang gabay na ito ay para sa mga mainnet o testnet na pag-setup

Ang gabay sa ibaba ay magtuturo sa iyo kung paano i-set up ang isang Polygon Edge network sa isang cloud provider para sa isang production na pag-setup ng iyong testnet o mainnet.

Kung nais mong i-setup ang isang Polygon Edge network nang lokal para mabilisang i-test ang `polygon-edge` bago gawin ang isang production-like na pag-setup, mangyaring sumangguni sa
**[Lokal na pag-setup](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Mga kinakailangan {#requirements}

Sumangguni sa [Pag-install](/docs/edge/get-started/installation) para i-install ang Polygon Edge.

### Pag-set up ng VM connectivity {#setting-up-the-vm-connectivity}

Depende sa pagpili mo ng cloud provider, maaari mong i-set up ang mga connectivity at mga patakaran sa pagitan ng mga VM gamit ang isang firewall, mga security group, o mga access control list.

Bilang tanging bahagi ng `polygon-edge` na kailangang ilantad sa iba pang mga VM ay ang libp2p server, ang simpleng pagpapahintulot lamang
sa lahat ng komunikasyon sa pagitan ng mga VM sa default libp2p port `1478` ay sapat na.

## Pangkalahatang-ideya {#overview}

![Pag-Setup sa Cloud](/img/edge/ibft-setup/cloud.svg)

Sa gabay na ito, ang layunin natin ay magtatag ng isang gumaganang `polygon-edge` blockchain network na gumagana sa [protokol ng consensus ng IBFT](https://github.com/ethereum/EIPs/issues/650).
Ang blockchain network ay bubuuin ng 4 na node kung saan ang lahat ng 4 na ito ay mga validator node, at dahil dito, kwalipikado ang mga ito para sa proposing block at mga validating block na nagmula sa ibang mga proposer.
Ang bawat isa sa 4 na mga node ay magpapatakbo sa sarili nitong VM, dahil ang idea ng gabay na ito ay magbigay sa iyo ng isang ganap na gumaganang Polygon Edge network habang pinapanatiling pribado ang mga validator key para matiyak ang isang trustless na network na setup.

Para magawa iyon, gagabayan ka namin sa pamamagitan ng 4 na madaling hakbang:

0. Tingnan ang listahan ng mga **Kinakailangan** sa itaas
1. Buuin ang mga pribadong key para sa bawat validator, at simulan ang data directory
2. Ihanda ang connection string para sa bootnode na ilalagay sa ibinabahaging `genesis.json`
3. Likhain ang `genesis.json` sa iyong lokal na machine, at ipadala/ilipat ito sa bawat node
4. Simulan ang lahat ng mga node

:::info Bilang ng mga validator

Walang minimum sa bilang ng mga node sa isang cluster, na nangangahulugang ang mga cluster na may 1 lang na validator node ay posible.
Tandaan na sa pamamagitan ng _single_ node cluster, **walang crash tolerance** at **walang BFT guarantee**.

Ang minimum na inirerekomendang bilang ng mga node para makakamit ng BFT guarantee ay 4 - dahil sa isang 4 na node cluster, ang pagpalya ng
1 node ay maaaring i-tolerate, hangga't gumagana nang normal ang 3 natitira.

:::

## Hakbang 1: Simulan ang mga data folder at bumuo ng mga validator key {#step-1-initialize-data-folders-and-generate-validator-keys}

Para mapagana at mapatakbo ang Polygon Edge, kailangan mong simulan ang mga data folder sa bawat node:


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

Ipi-print ng bawat isa sa mga command na ito ang validator key, bls public key, at [node ID](https://docs.libp2p.io/concepts/peer-id/). Kakailanganin mo ang Node ID ng unang node para sa susunod na hakbang.

### Mga output Secret {#outputting-secrets}
Maaaring i-retrieve ulit ang output ng lihim, kung kinakailangan.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Sa iyo lang dapat ang iyong data directory!

Ang mga data directory na binuo sa itaas, bukod sa pagpapasimula ng mga directory para sa pagpapanatili ng blockchain state, ay magbubuo rin ng iyong validator's private key.
**Pananatilihing lihim ang key na ito, dahil ang pagnanakaw rito ay magpapahintulot para magpanggap na validator sa network!**

:::

## Hakbang 2: Ihanda ang multiaddr connection string para sa bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Para matagumpay na makagawa ng koneksyon ang isang node, alam dapat nito kung sa aling `bootnode` server kokonekta para makakuha ng
impormasyon tungkol sa lahat ng natitirang node sa network. Kilala rin minsan ang `bootnode` bilang `rendezvous` server sa p2p jargon.

`bootnode` ay hindi isang espesyal na instance ng isang Polygon Edge node. Bawat Polgyon Edge node ay maaaring magsilbing isang `bootnode` at
bawat Polygon Edge node ay dapat magkaroon ng isang set ng mga bootnode na tinukoy na makokontak para makapaglaan ng impormasyon kung paano makikipag-ugnayan dito ang lahat ng natitirang node sa network.

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

Bilang unang bahagi ng multiaddr connection string ang `<ip_address>`, dito kakailanganin mong i-enter ang IP address na maaabot ng ibang mga node, ito ay maaaring maging pribado o pampublikong IP address depende sa iyong setup, hindi `127.0.0.1`.

Para sa `<port>` gagamitin natin ang `1478`, dahil ito ang default na libp2p port.

At panghuli, kailangan natin ang `<node_id>` na maaari nating makuha sa output ng dating pinatakbong command na `polygon-edge secrets init --data-dir data-dir` command (na ginamit para bumuo ng mga key at data directory para sa `node 1`)

Pagkatapos ng pagbuo, ang multiaddr connection string sa `node 1` na gagamitin natin bilang bootnode ay magiging parang ganito (ang `<node_id>` lang na nasa dulo ay naiiba dapat):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Sa katulad na paraan, binubuo natin ang multiaddr para sa pangalawang bootnode gaya ng ipinapakita sa ibaba
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info Mga DNS hostname sa halip na ips

Sumusuporta ang Polygon Edge gamit ang mga DNS hostname para sa configuration ng mga node. Lubos na kapaki-pakinabang na feature ito para sa mga cloud based na deployment, dahil ang ip ng node ay maaaring magbago dahil sa iba't ibang dahilan.

Ang multiaddr format para sa connection string habang ginagamit ang mga DNS hostname ay gaya ng sumusunod:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Hakbang 3: Buuin ang genesis file gamit ang 4 na node bilang mga validator {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Ang hakbang na ito ay maaaring patakbuhin sa iyong lokal na machine, ngunit kakailanganin mo ang mga pampublikong validator key para sa bawat isa sa 4 na validator.

Maaaring ligtas na maibahagi ng mga validator ang `Public key (address)` gaya ng ipinapakita sa ibaba sa output ng kanilang `secrets init` mga command, para
maaari mong ligtas na mabuo ang genesis.json kasama ang mga validator na iyon sa panimulang validator set, na kinilala ng kanilang mga pampublikong key:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Kapag natanggap mo ang lahat ng 4 na mga pampublikong key ng validator, maaari mong patakbuhin ang sumusunod na command para mabuo ang `genesis.json`

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Ang ginagawa ng command na ito:

* Itinatakda ng `--ibft-validator` ang pampublikong key ng validator na dapat isama sa paunang validator set sa genesis block. Maaaring magkaroon ng maraming mga paunang validator.
* Itinatakda ng `--bootnode` ang address ng bootnode na magbibigay-daan sa mga node na mahanap ng mga ito ang isa't isa.
Gagamitin natin ang multiaddr string ng `node 1`, gaya ng nabanggit sa **hakbang 2** , kahit maaari kang magdagdag ng gaano karaming bootnode na gusto mo, gaya ng ipinapakita sa itaas.

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

Pagkatapos tukuyin ang:
1. Mga pampublikong key ng validator na dapat isama sa genesis block bilang validator set
2. Bootnode multiaddr connection strings
3. Mga premined na account at balanse na isasama sa genesis block

at pagbuo ng `genesis.json`, dapat mong kopyahin ito sa lahat ng mga VM sa network. Depende sa iyong setup, maaari mong
kopyahin/i-paste, ipadala ito sa node operator, o simpleng i-SCP/FTP ito.

Ang istruktura ng genesis file ay tinatalakay sa seksyong [Mga CLI Command](/docs/edge/get-started/cli-commands).

## Hakbang 4: Patakbuhin ang lahat ng client {#step-4-run-all-the-clients}

:::note Networking sa mga Cloud provider

Karamihan ng mga cloud provider ay hindi naglalantad ng mga IP address (lalo na ang mga pampubliko) bilang isang tuwirang network interface sa iyong VM, sa halip ay mag-setup ng hindi nakikitang NAT proxy.


Para pahintulutan ang mga node na makakonekta sa isa't isa, kailangan mong makinig sa `0.0.0.0` IP address para mag-bind sa lahat ng mga interface, ngunit kailangan mo pa ring tukuyin ang IP address o DNS address na maaaring gamitin ng ibang mga node para makakonekta sa iyong instance. Makakamit ito sa pamamagitan ng alinman sa paggamit ng `--nat` o `--dns`argumento kung saan maaari mong tukuyin ang iyong external IP o DNS address.

#### Halimbawa {#example}

Ang kaugnay na IP address na gusto mong mapakinggan ay `192.0.2.1`, ngunit hindi ito tuwirang naka-bound sa alinman sa iyong mga network interface.

Para pahintulutan ang mga node na maka-connect, kailangan mong mapasa ang sumusunod na mga parameter:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

O kung gusto mong tukuyin ang isang DNS address `dns/example.io`, ipasa ang sumusunod na mga parameter:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Gagawin nitong nakikinig ang iyong mga node sa lahat ng mga interface, ngunit ipinapaalam din nito na ang mga kliyente ay kumokonekta rito sa pamamagitan ng isang tinukoy na `--nat` o `--dns` address.

:::

Para patakbuhin ang **unang** client:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para patakbuhin ang **pangalawang** client:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para patakbuhin ang **pangatlong** client:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para patakbuhin ang **pang-apat** na client:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

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
Sa kasalukuyan, sinusuportahan lang namin ang `json`configuration file, makikita ang sample config file **[dito](/docs/edge/configuration/sample-config)**

:::

:::info Mga hakbang para makapagpatakbo ng non-validator node

Isi-sync palagi ng Non-validator ang mga pinakabagong block na natanggap mula sa validator node, maaari kang magsimula ng non-validator node sa pamamagitan ng pagpapatakbo sa sumusunod na command.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Halimbawa, maaari kang magdagdag ng **panlimang** Non-validator client sa pamamagitan ng pagsasagawa ng sumusunod na command:

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Tukuyin ang limitasyon sa presyo

Ang isang Polygon Edge node ay maaaring simulan nang may nakatakdang **limitasyon sa presyo** para sa mga papasok na transaksyon.

Ang unit para sa limitasyon sa presyo ay `wei`.

Kapag nagtakda ng limitasyon sa presyo, nangangahulugan ito na ang anumang transaksyon na naiproseso ng kasalukuyang node ay kailangang magkaroon ng gas price na **mas mataas**
kaysa sa itinakdang limitasyon sa presyo, kung hindi ay hindi ito masasama sa isang block.

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
