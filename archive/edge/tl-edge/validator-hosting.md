---
id: validator-hosting
title: Pag-host ng Validator
description: "Mga kinakailangan sa pag-host para sa Polygon Edge"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Makikita sa ibaba ang mga mungkahi para sa maayos na pag-host ng isang validator node sa isang Polygon Edge network. Mangyaring maingat na bigyang-pansin ang lahat ng mga bagay na nakalista sa ibaba para matiyak
na ang iyong pag-setup ng validator ay maayos na na-configure para maging ligtas, matatag, at gumagana.

## Batayang kaalaman {#knowledge-base}

Bago subukang patakbuhin ang validator node, mangyaring basahin nang mabuti ang dokumentong ito.   
Ang mga karagdagang dokumento na maaaring makatulong ay:

- [Pag-install](get-started/installation)
- [Pag-setup sa Cloud](get-started/set-up-ibft-on-the-cloud)
- [Mga CLI Command](get-started/cli-commands)
- [Server config file](configuration/sample-config)
- [Mga pribadong key](configuration/manage-private-keys)
- [Prometheus metrics](configuration/prometheus-metrics)
- [Mga secret manager](/docs/category/secret-managers)
- [Pag-backup/Pag-restore](working-with-node/backup-restore)

## Minimum na kailangan ng sytem {#minimum-system-requirements}

| Uri | Value | Inimpluwensiyahan ng |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 core | <ul><li>Bilang ng mga JSON-RPC query</li><li>Size ng blockchain state</li><li>Block gas limit</li><li>Block time</li></ul> |
| RAM | 2 GB | <ul><li>Bilang ng mga JSON-RPC query</li><li>Size ng blockchain state</li><li>Block gas limit</li></ul> |
| Disk | <ul><li>10 GB root partition</li><li>30 GB root partition na may LVM para sa disk extension</li></ul> | <ul><li>Size ng blockchain state</li></ul> |


## Service configuration {#service-configuration}

Kailangang awtomatikong tumakbo ang `polygon-edge` binary bilang isang system service pagkatapos ma-establish ang network connectivity at mayroong simulan / itigil / i-restart
na mga functionality. Inirerekomenda namin ang paggamit ng isang service manager tulad ng `systemd.`

Halimbawa `systemd`system configuration file:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Binary {#binary}

Sa mga production workload dapat na i-deploy ang `polygon-edge` binary mula sa mga pre-built GitHub release binary - hindi sa manual na pag-compile.
:::info

Sa pamamagitan ng manual na pag-compile ng `develop` GitHub branch, maaari mong ipakilala ang mga breaking change sa iyong environment.   
Sa dahilang iyon, inirerekomendang i-deploy lamang ang Polygon Edge binary mula sa mga release, dahil naglalaman ito ng
impormasyon tungkol sa mga breaking change at kung paano pagtagumpayan ang mga ito.

:::

Mangyaring tingnan ang [Pag-install](/docs/edge/get-started/installation) para sa isang kumpletong pangkalahatang-ideya ng paraan ng pag-install.

### Data storage {#data-storage}

Ang `data/` folder na naglalaman ng kabuuang blockchain state ay dapat i-mount sa isang partikular na disk / volume na para sa
awtomatikong disk backup, volume extension at opsyonal na pag-mount ng disk/volume sa ibang instance kung sakaling magkaroon ng pagpalya.


### Mga log file {#log-files}

Kailangang paikutin ang mga log araw-araw (gamit ang tool tulad ng `logrotate`).
:::warning

Kung naka-configure nang walang log rotation, maaaring ubusin ng mga log file ang lahat ng available na disk space na maaaring makagambala sa validator uptime.

:::

Halimbawang `logrotate` configuration:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Sumangguni sa [Logging](#logging) na seksyon sa ibaba para sa mga rekomendasyon sa log storage.

### Karagdagang mga dependency {#additional-dependencies}

`polygon-edge` ay na-compile nang hindi nagbabago, na hindi nangangailangan ng mga karagdagang host OS dependency.

## Maintenance {#maintenance}

Makikita sa ibaba ang mga pinakamahusay na gawain para ma-maintain ang isang gumaganang validator node ng isang Polygon Edge network.

### Pag-backup {#backup}

May dalawang uri ng mga pamamaraan sa pag-back up na inirerekomenda para sa mga Polygon Edge node.

Ang mungkahi ay gamitin itong pareho, hangga't maaari, na ang Polygon Edge backup ang laging available na opsyon.

* Pag-***backup ng Volume***    
  Araw-araw na incremental backup ng `data/` volume ng Polygon Edge node, o ng kumpletong VM kung posible.


* ***Polygon Edge backup***:    
  Inirerekomenda ang araw-araw na CRON job na ginagawa ang mga regular na pag-backup ng Polygon Edge at inililipat ang mga `.dat` file sa isang offsite na lokasyon o sa isang ligtas na cloud object storage.

Ang Polygon Edge backup ay hindi dapat mag-overlap sa Volume backup na inilarawan sa itaas.

Sumangguni sa [Pag-backup/ibalik na node instance](working-with-node/backup-restore) para sa mga tagubilin kung paano isagawa ang mga backup sa Polygon Edge.

### Pag-log {#logging}

Ang mga log na in-output ng mga Polygon Edge node ay dapat:
- ipadala sa isang external data store na may kakayahan sa indexing at pag-search
- mayroong panahon ng log retention na 30 araw

Kung ito ang unang beses mong pag-set up ng isang Polygon Edge validator, inirerekomenda naming simulan ang node
gamit ang `--log-level=DEBUG` na opsyon para mabilis na i-debug ang anumang mga isyung maaari mong makaharap.

:::info

Ang`--log-level=DEBUG` ay gagawing verbose ang log output ng node hangga't maaari.   
Ang mga debug log ay mabilis na magdadagdag sa size ng log file at dapat isaalang-alang kapag nag-set up
ng log rotation solution.

:::
### Mga OS security patch {#os-security-patches}

Kailangan tiyakin ng mga administrator na ang validator instance OS ay palaging updated sa mga pinakabagong patch nang hindi bababa sa isang beses bawat buwan.

## Metrics {#metrics}

### Metrics ng system {#system-metrics}

Kailangang i-setup ng mga administrator ang ilang uri ng pag-monitor sa metrics ng system, (hal. Telegraf + InfluxDB + Grafana o isang 3rd party SaaS).

Metrics na kailangang masubaybayan at kailangang magkaroon ng alarm notification setup:

| Pangalan ng metric | Alarm threshold |
|-----------------------|-------------------------------|
| CPU usage (%) | > 90% sa loob ng higit sa 5 minuto |
| RAM utilization (%) | > 90% sa loob ng higit sa 5 minuto |
| Root disk utilization | > 90% |
| Data disk utilization | > 90% |

### Validator metrics {#validator-metrics}

Kailangang i-setup ng mga administrator ang koleksyon ng metrics mula sa Polygon Edge Prometheus API para
masubaybayan ang blockchain performance.

Sumangguni sa [Prometheus metrics](configuration/prometheus-metrics) para maunawaan kung aling metrics ang inilantad at kung paano i-set up ang Prometheus metric collection.


Kailangan ng karagdagang pansin sa sumusunod na metrics:
- ***Panahon ng block production*** - kung ang panahon ng block production ay mas mataas kaysa sa normal, mayroong potensyal na problema sa network
- ***Bilang ng mga consensus round*** - kung mayroong higit sa 1 round, mayroong potensyal na problema sa validator na nakatakda sa network
- ***Bilang ng mga peer*** - kung bumaba ang bilang ng mga peer, mayroong isyu sa koneksyon sa network

## Seguridad {#security}

Makikita sa ibaba ang mga pinakamahusay na gawain para panatilihing ligtas ang isang gumaganang validator node ng isang Polygon Edge network.

### Mga serbisyo ng API {#api-services}

- ***JSON-RPC*** -
Tanging ang API service lamang ang kailangang ilantad sa publiko (sa pamamagitan ng load balancer o direkta).   
Ang API na ito ay dapat gumana sa lahat ng mga interface o sa espisipikong IP address (halimbawa: `--json-rpc 0.0.0.0:8545` o `--json-prc 192.168.1.1:8545`).
:::info

Dahil ito ay pampublikong API, inirerekomendang magkaroon ng load balancer / reverse proxy sa front nito para maglaan ng seguridad at rate limiting.

:::


- ***LibP2P*** -
Ito ang networking API na ginagamit ng mga node para sa peer communication. Kailangang gumana ito sa lahat ng mga interface o sa isang espisipikong ip address
(`--libp2p 0.0.0.0:1478` o `--libp2p 192.168.1.1:1478`). Ang API na ito ay hindi dapat ilantad sa publiko,
ngunit dapat itong maabot mula sa lahat ng iba pang mga node.
:::info

Kung tumakbo sa localhost ( `--libp2p 127.0.0.1:1478` ) hindi makaka-connect ang ibang mga node.

:::


- ***GRPC*** -
Ang API na ito ay ginagamit lamang para sa pagpapatakbo ng mga operator command at wala nang iba pa. Kaya dapat itong tumakbo lamang sa localhost (`--grpc-address 127.0.0.1:9632`).

### Mga Polygon Edge secret {#polygon-edge-secrets}

Ang mga Polygon Edge secret (`ibft` at `libp2p` key) ay hindi dapat i-imbak sa isang local file system.  
Sa halip, dapat gamitin ang isang suportadong [Secret Manager](configuration/secret-managers/set-up-aws-ssm).   
Ang pag-imbak ng mga secret sa local file system ay dapat lamang gamitin sa mga non-production environment.

## Update {#update}

Ang sumusunod ay ang inirerekomendang update procedure para sa mga validator node, na inilarawan nang step-by-step na mga tagubilin.

### Update procedure {#update-procedure}

- I-download ang pinakabagong Polygon Edge binary mula sa opisyal na mga GitHub [release](https://github.com/0xPolygon/polygon-edge/releases)
- Ihinto ang Polygon Edge service (halimbawa: `sudo systemctl stop polygon-edge.service`)
- Palitan ang umiiral na `polygon-edge` binary na gamit ang na-download na (halimbawa: `sudo mv polygon-edge /usr/local/bin/`)
- Tingnan kung tama ang `polygon-edge` bersyon sa pamamagitan ng pagpapatakbo ng `polygon-edge version` - dapat na katugma ito ng bersyon ng release
- Tingnan ang dokumentasyon ng release kung mayroong mga backwards compatibility step na kailangang gawin bago simulan ang `polygon-edge` service
- Simulan ang `polygon-edge` service (halimbawa: `sudo systemctl start polygon-edge.service`)
- Panghuli, tingnan ang `polygon-edge` log output at tiyaking tumatakbo ang lahat nang walang anumang mga `[ERROR]` log

:::warning

Kapag mayroong breaking release, dapat isagawa ang update procedure na ito sa lahat ng mga node dahil
ang kasalukuyang tumatakbong binary ay hindi compatible sa bagong release.

Nangangahulugan ito na dapat ihinto ang chain nang pansamantala (hanggang ang mga `polygon-edge` binary ay mapalitan o ma-restart ang service)
kaya planuhin nang maayos.

Maaari kang gumamit ng mga tool tulad ng **[Ansible](https://www.ansible.com/)** o ng custom script para maisagawa nang mahusay ang update
at mabasawan ang chain downtime.

:::

## Startup procedure {#startup-procedure}

Ang sumusunod ay ang inirerekomendang daloy ng startup procedure para sa Polygon Edge validator

- Basahin ang mga dokumento na nakalista sa [Batayang Kaalaman](#knowledge-base) na seksyon
- I-apply ang pinakabagong mga OS patch sa validator node
- I-download ang pinakabagong `polygon-edge` binary mula sa opisyal na mga GitHub [release](https://github.com/0xPolygon/polygon-edge/releases) at ilagay ito sa local instance `PATH`
- Simulan ang isa sa mga suportadong [secret manager](/docs/category/secret-managers) gamit ang `polygon-edge secrets generate` CLI command
- Bumuo at mag-imbak ng mga secret gamit ang `polygon-edge secrets init` [CLI command](/docs/edge/get-started/cli-commands#secrets-init-flags)
- Tandaan ang mga `NodeID` at `Public key (address)` na value
- Buuin ang `genesis.json` file na inilarawan sa [pag-setup sa cloud](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) gamit ang `polygon-edge genesis` [CLI command](/docs/edge/get-started/cli-commands#genesis-flags)
- Buuin ang default config file gamit ang `polygon-edge server export` [CLI command](/docs/edge/configuration/sample-config)
- I-edit ang `default-config.yaml` file para ma-accommodate ang local validator node environment (mga file path, atbp.)
- Gumawa ng isang Polygon Edge service (`systemd` o katulad) kung saan ang patatakbuhin ng `polygon-edge` binary ang server mula sa isang `default-config.yaml` file
- Simulan ang Polygon Edge server sa pamamagitan ng pagsisimula ng service (halimbawa: `systemctl start polygon-edge`)
- Tingnan ang mga `polygon-edge` log output at tiyaking nabubuo ang mga block at walang mga `[ERROR]` log
- Tingnan ang functionality ng chain sa pamamagitan ng pagtawag ng isang JSON-RPC na pamamaraan tulad ng [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)
